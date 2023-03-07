import React, { ReactElement, Component } from 'react';
import { useHistory } from 'react-router-dom';
import { Recording } from '../common/Recording.interface';
import { RecorderState } from '../store/types';
import * as actions from '../store/actions';
import { connect } from 'react-redux';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import dayjsDuration from 'dayjs/plugin/duration';
import prettyBytes from 'pretty-bytes';

import { msToTime } from '../utils';
import AcoustidResults from '../components/AcoustidResults';
import CommonMetadata from '../components/CommonMetadata';

import { Tooltip, useTheme } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import { visuallyHidden } from '@mui/utils';
import StorageStatusDisplay from '../components/StorageStatusDisplay';
import { useRecordings } from '@/contexts/RecordingsContext';

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(dayjsDuration);

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback: React.ReactNode;
};

type ErrorBoundaryState = { hasError: boolean };

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error(error);
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

const ErrorFallback = () => {
  const theme = useTheme();
  const history = useHistory();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: `calc(100vh - ${theme.dimensions.Navigation.height}px)`,
        textAlign: 'center',
      }}
    >
      <div>Oops, something broke...</div>
      <div style={{ marginTop: 8 }}>
        <button onClick={() => history.goBack()}>Go back</button>
      </div>
    </div>
  );
};

interface Props {
  recording: Recording;
  caching: boolean;
}

export function RecordingDetail({ recording }: Props): ReactElement {
  const history = useHistory();
  const theme = useTheme();
  const [, , , { editRecording }] = useRecordings();

  const duration = recording?.duration || 0;
  const durationObj = dayjs.duration(duration * 1000);

  const handleEditRecording = (
    recordingId: string,
    update: Partial<Recording>
  ) => {
    editRecording(recordingId, update);
  };

  if (!recording) return <div>No recording selected</div>;

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <div>
        <div
          style={{
            padding: 8,
            paddingTop: 0,
            paddingBottom: theme.dimensions.Player.height,
            marginBottom: 48,
            display: 'flex',
            flexDirection: 'column',
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
              <Tooltip title={recording.title}>
                <Typography
                  style={{
                    lineHeight: '30px',
                    maxWidth: theme.dimensions.Tray.width - 58,
                  }}
                  noWrap
                >
                  {recording.title}
                </Typography>
              </Tooltip>
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
              <Typography style={visuallyHidden}>
                {'Duration: ' +
                  (durationObj.hours()
                    ? `${durationObj.hours()} hours, `
                    : '') +
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
          {recording.common && (
            <CommonMetadata
              common={recording.common}
              musicBrainzCoverArt={recording.musicBrainzCoverArt}
            />
          )}
          {recording.acoustidResults?.length > 0 && (
            <AcoustidResults
              acoustidResults={recording.acoustidResults}
              recording={recording}
              handleEditRecording={handleEditRecording}
            />
          )}
          <StorageStatusDisplay />
        </div>
      </div>
    </ErrorBoundary>
  );
}

const mapStateToProps = (state: RecorderState) => {
  return {
    recording: state.selectedRecording,
    caching: state.caching,
  };
};

export default connect(mapStateToProps, actions)(RecordingDetail);
