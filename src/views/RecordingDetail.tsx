import React, { ReactElement, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Recording } from '../common/Recording.interface';
import { RecorderState } from '../store/types';
import * as actions from '../store/actions';
import { editRecording } from '../effects';
import { connect, useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import dayjsDuration from 'dayjs/plugin/duration';
import prettyBytes from 'pretty-bytes';

import useAudioPreview from '../hooks/useAudioPreview';
import { msToTime } from '../utils';
import AudioPlayer from '../components/AudioPlayer';

import { Checkbox, List, useTheme } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import { ICommonTagsResult } from 'music-metadata';
import { AcoustidResult } from '../common/AcoustidResult.interface';
import { MusicBrainzCoverArt } from '../common/MusicBrainzCoverArt.interface';
import AcoustidReleaseGroupCard from '../components/AcoustidReleaseGroupCard';
import AcoustidRecordingListItem from '../components/AcoustidRecordingListItem';

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(dayjsDuration);

interface CommonTagsResult extends ICommonTagsResult {
  [key: string]: any;
}

const renderCommonValue = (value: any) => {
  if (typeof value === 'string') return value;

  if (Array.isArray(value)) return value.join(', ');

  if (typeof value === 'object')
    // return Object.keys(value).map((key) => `${key} ${value[key]} `);
    return Object.keys(value).map(
      (key) =>
        `${key.replace('no', '').replace('of', ' / ')} ${JSON.stringify(
          value[key]
        ).replace('null', '0')} `
    );

  return JSON.stringify(value);
};

const renderCommon = (
  common: CommonTagsResult,
  musicBrainzCoverArt: MusicBrainzCoverArt
) => {
  const keys = Object.keys(common);

  const IGNORED_COMMON_KEYS = ['musicbrainz_releasegroupid'];

  return (
    <div style={{ marginTop: 16 }}>
      <Typography>Metadata:</Typography>
      <table style={{ width: '100%' }}>
        <tbody>
          {musicBrainzCoverArt && (
            <tr>
              <td style={{ border: `1px solid #fff` }}>
                <Typography variant="caption" color="textSecondary">
                  Cover Art
                </Typography>
              </td>
              <td style={{ border: `1px solid #fff` }}>
                <img
                  height="50"
                  width="50"
                  src={
                    musicBrainzCoverArt?.thumbnails.small ||
                    musicBrainzCoverArt?.image
                  }
                />
              </td>
            </tr>
          )}
          {keys
            .filter((key) => !IGNORED_COMMON_KEYS.includes(key))
            .sort()
            .map((key, i) => (
              <tr key={`common-meta_${i}`}>
                <td style={{ border: `1px solid #fff` }}>
                  <Typography variant="caption" color="textSecondary">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Typography>
                </td>
                <td style={{ border: `1px solid #fff` }}>
                  <Typography variant="caption" color="textSecondary">
                    {renderCommonValue(common[key])}
                  </Typography>
                </td>
              </tr>
            ))}
        </tbody>
        <tfoot>
          <tr>
            <td></td>
            <td>
              <Button size="small" style={{ textTransform: 'none' }}>
                <Typography variant="caption" color="textSecondary">
                  + add more info
                </Typography>
              </Button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

interface Props {
  recording: Recording;
  caching: boolean;
}

export function RecordingDetail({ recording, caching }: Props): ReactElement {
  const [excludeCompilations, setExcludeCompilations] = useState(false);

  const history = useHistory();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();

  const duration = recording.duration;
  const durationObj = dayjs.duration(duration * 1000);

  /**
   * https://yagisanatode.com/2021/07/03/get-a-unique-list-of-objects-in-an-array-of-object-in-javascript/
   */
  const uniqueAcoustidRecordings = recording.acoustidResults
    ? [
        ...new Map(
          recording.acoustidResults[0].recordings.map((item) => [
            item['releasegroups'][0]['id'],
            item,
          ])
        ).values(),
      ]
    : [];

  // const uniqueAcoustidRecordings = recording.acoustidResults[0].recordings;

  const handleExcludeCompilations = () => {
    setExcludeCompilations(!excludeCompilations);
  };

  const handleEditRecording = (recordingId: string, update: any) => {
    dispatch(editRecording(recordingId, update));
  };

  console.log('RecordingDetail, recording:', recording);

  return (
    <div>
      <div
        style={{
          padding: 8,
          paddingTop: 0,
          marginBottom: 48,
          display: 'flex',
          flexDirection: 'column',
          // height:
          //   theme.dimensions.Tray.height - theme.dimensions.Navigation.height,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            position: 'sticky',
            top: theme.dimensions.Navigation.height,
            backgroundColor: theme.palette.background.default,
            zIndex: theme.zIndex.appBar,
          }}
        >
          <div>
            <Typography style={{ lineHeight: '30px' }}>
              {recording.title}
            </Typography>
          </div>
          <div>
            <IconButton size="small" onClick={() => history.goBack()}>
              <CloseIcon />
            </IconButton>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <Typography variant="caption" color="textSecondary">
              {dayjs(recording.created).format('MMMM Do YYYY, h:mm A')}
            </Typography>
          </div>
          <div>
            <Typography
              variant="caption"
              color="textSecondary"
              aria-hidden="true"
            >
              {msToTime(Math.trunc(duration * 1000))}
            </Typography>
            <Typography variant="srOnly">
              {'Duration: ' +
                (durationObj.hours() ? `${durationObj.hours()} hours, ` : '') +
                (durationObj.minutes()
                  ? `${durationObj.minutes()} minutes, `
                  : '') +
                (durationObj.seconds()
                  ? `${durationObj.seconds()} seconds `
                  : '')}
            </Typography>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <div>
            <Typography
              variant="caption"
              color="textSecondary"
            >{`Size: ${prettyBytes(recording.size)}`}</Typography>
          </div>
          <div>
            <Typography
              variant="caption"
              color="textSecondary"
            >{`Format: ${recording.format}`}</Typography>
          </div>
          <div>
            <Typography
              variant="caption"
              color="textSecondary"
            >{`Channels: ${recording.channels}`}</Typography>
          </div>
        </div>
        {/* <div style={{ flex: 1 }}></div> */}
        {recording.common &&
          renderCommon(recording.common, recording.musicBrainzCoverArt)}
        {recording.acoustidResults?.length && (
          <div>
            <div>
              <div style={{ marginBottom: 0 }}>AcoustID results:</div>
              <div style={{ marginBottom: 8, display: 'flex' }}>
                <Typography style={{ lineHeight: '38px' }} variant="caption">
                  Exclude compilations
                </Typography>
                <Checkbox
                  size="small"
                  value={excludeCompilations}
                  onChange={handleExcludeCompilations}
                />
              </div>
            </div>

            <List>
              {uniqueAcoustidRecordings.map((acoustidRecording) => (
                <AcoustidRecordingListItem
                  acoustidRecording={acoustidRecording}
                  recording={recording}
                  excludeCompilations={excludeCompilations}
                  handleEditRecording={handleEditRecording}
                >
                  {acoustidRecording.releasegroups
                    .filter((acoustidReleaseGroup) =>
                      excludeCompilations
                        ? !acoustidReleaseGroup.secondarytypes?.includes(
                            'Compilation'
                          )
                        : acoustidReleaseGroup
                    )
                    .map((acoustidReleaseGroup) => (
                      <AcoustidReleaseGroupCard
                        key={`acoustid-releasegroup_${acoustidReleaseGroup.id}`}
                        recording={recording}
                        acoustidRecording={acoustidRecording}
                        acoustidReleaseGroup={acoustidReleaseGroup}
                        handleEditRecording={handleEditRecording}
                      />
                    ))}
                </AcoustidRecordingListItem>
              ))}
            </List>
          </div>
        )}
      </div>
      {/* <div
        style={{
          position: 'fixed',
          width: '100%',
          bottom: 0,
        }}
      >
        <AudioPlayer recording={recording} caching={caching} />
      </div> */}
    </div>
  );
}

const mapStateToProps = (state: RecorderState) => {
  return {
    recording: state.selectedRecording,
    caching: state.caching,
  };
};

export default connect(mapStateToProps, actions)(RecordingDetail);
