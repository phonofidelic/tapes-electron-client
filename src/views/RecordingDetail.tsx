import React, { ReactElement, useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Recording } from '../common/Recording.interface';
import { RecorderState } from '../store/types';
import * as actions from '../store/actions';
import { connect } from 'react-redux';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import dayjsDuration from 'dayjs/plugin/duration';
import prettyBytes from 'pretty-bytes';

import useAudioPreview from '../hooks/useAudioPreview';
import { msToTime } from '../utils';
import AudioPlayer from '../components/AudioPlayer';

import { useTheme } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(dayjsDuration);

interface Props {
  bucketToken: string;
  recording: Recording;
  caching: boolean;
}

export function RecordingDetail({
  bucketToken,
  recording,
  caching,
}: Props): ReactElement {
  const history = useHistory();
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();

  // const audioRef = useRef(null)

  // const { curTime, duration, playing, setPlaying, setClickedTime } =
  //   useAudioPreview(recording._id);

  const duration = recording.duration;

  const durationObj = dayjs.duration(duration * 1000);

  return (
    <div>
      <div
        style={{
          padding: 8,
          display: 'flex',
          flexDirection: 'column',
          height:
            theme.dimensions.Tray.height - theme.dimensions.Navigation.height,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
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
      </div>
      <div
        style={{
          position: 'fixed',
          width: '100%',
          bottom: 0,
        }}
      >
        <AudioPlayer
          recording={recording}
          bucketToken={bucketToken}
          caching={caching}
        />
      </div>
    </div>
  );
}

const mapStateToProps = (state: RecorderState) => {
  return {
    bucketToken: state.bucketToken,
    recording: state.selectedRecording,
    caching: state.caching,
  };
};

export default connect(mapStateToProps, actions)(RecordingDetail);
