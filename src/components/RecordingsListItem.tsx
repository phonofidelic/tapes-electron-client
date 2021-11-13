import React, { ReactElement, useState, useEffect, useRef } from 'react';
// import { connect, useDispatch } from 'react-redux';
// import * as actions from '../store/actions';
import { useHistory } from 'react-router-dom';
import prettyBytes from 'pretty-bytes';
import styled from 'styled-components';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import dayjsDuration from 'dayjs/plugin/duration';
import { Recording } from '../common/Recording.interface';
import useHover from '../hooks/useHover';
import { RecorderState, SelectRecordingAction } from '../store/types';
import useAudioPreview from '../hooks/useAudioPreview';
import { msToTime } from '../utils';

import PlayButton from './PlayButton';
import StopButton from './StopButton';

import IconButton from '@material-ui/core/IconButton';
import LinearProgress from '@material-ui/core/LinearProgress';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Grow from '@material-ui/core/Grow';
import Fade from '@material-ui/core/Fade';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import EditIcon from '@material-ui/icons/Edit';
import CloseIcon from '@material-ui/icons/Close';
import { useTheme } from '@material-ui/core/styles';

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(dayjsDuration);

const PlaybackButtonContainer = styled.div`
  &:not(:focus) {
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }
`;

interface RecordingsListItemProps {
  bucketToken: string;
  recording: Recording;
  selectedRecording: Recording;
  handleSelectRecording(recording: Recording): void;
  handleDeleteRecording(recordingId: string): void;
  handleEditRecording(recordingId: string, update: any): void;
  handleDownloadRecording(recordingId: string): void;
}

export function RecordingsListItem({
  bucketToken,
  recording,
  selectedRecording,
  handleSelectRecording,
  handleDeleteRecording,
  handleEditRecording,
  handleDownloadRecording,
}: RecordingsListItemProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const [hoverRef, hovered] = useHover();
  const [titleHoverRef, titleHovered] = useHover();
  const history = useHistory();
  const progressRef = useRef(null);

  const { curTime, duration, playing, setPlaying, setClickedTime } =
    useAudioPreview(recording._id);
  const theme = useTheme();

  const selected = selectedRecording?._id === recording._id;
  const isPlaying = playing;
  const durationObj = dayjs.duration(duration * 1000);

  const handlePlay = () => {
    setPlaying(true);
  };

  const handleStop = () => {
    setPlaying(false);
  };

  const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSelectViewRecording = (recordingId: string) => {
    setAnchorEl(null);
    history.push({ pathname: `/library/${recordingId}`, state: recording });
  };

  const handleSelectDownloadRecording = (recordingId: string) => {
    setAnchorEl(null);
    handleDownloadRecording(recordingId);
  };

  const handleSelectDelete = (recordingId: string) => {
    setAnchorEl(null);
    handleDeleteRecording(recordingId);
  };

  const handleTitleChange = () => {
    console.log('handleTitleChange, newTitle:', newTitle);
    newTitle && handleEditRecording(recording._id, { title: newTitle });
    setEditing(false);
    setNewTitle('');
  };

  const handleOpenDetailView = (recordingId: string) => {
    history.push({ pathname: `/library/${recordingId}`, state: recording });
  };

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    console.log('*** click pos:', event.clientX);
    console.log('*** progressRef:', progressRef.current.offsetWidth);
    console.log(
      '*** progress click:',
      event.clientX / progressRef.current.offsetWidth
    );

    const clickedProgress = event.clientX / progressRef.current.offsetWidth;
    console.log('*** clickedProgress:', duration * clickedProgress);

    setClickedTime(duration * clickedProgress);
  };

  useEffect(() => {
    if (!selected) {
      setPlaying(false);
    }
  }, [selected]);

  return (
    <>
      <ListItem
        tabIndex={0}
        role="listitem"
        style={{
          cursor: selected ? 'auto' : 'pointer',
          userSelect: 'none',
          outline: 'none',
        }}
        ref={hoverRef}
        key={recording._id}
        divider
        // selected={selected}
        onClick={() => handleSelectRecording(recording)}
        onFocus={() => handleSelectRecording(recording)}
        onDoubleClick={() => handleOpenDetailView(recording._id)}
      >
        <ListItemText
          disableTypography={true}
          primary={
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              {!editing ? (
                <div style={{ display: 'flex' }}>
                  <div
                    role="button"
                    aria-label={`Edit ${recording.title}`}
                    tabIndex={0}
                    ref={titleHoverRef}
                    style={{
                      cursor: 'pointer',
                      textDecoration:
                        selected && titleHovered ? 'underline' : 'none',
                    }}
                    onClick={() => selected && setEditing(true)}
                  >
                    <Typography style={{ maxWidth: '50vw' }} noWrap>
                      {recording.title}
                    </Typography>
                  </div>

                  {selected && (
                    <div style={{ marginLeft: 8 }}>
                      <Fade in={titleHovered}>
                        <EditIcon fontSize="small" />
                      </Fade>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex' }}>
                  <div>
                    <TextField
                      id="edit-title-input"
                      placeholder={recording.title}
                      size="small"
                      autoFocus
                      onBlur={handleTitleChange}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                  </div>
                  <div style={{ marginLeft: 8 }}>
                    <IconButton size="small" onClick={() => setEditing(false)}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </div>
                </div>
              )}
              {selected && (
                <div
                  style={{
                    color: theme.palette.text.secondary,
                    display: 'flex',
                  }}
                >
                  <div
                    style={{
                      border: `2px solid ${theme.palette.text.secondary}`,
                      borderRadius: 2,
                      lineHeight: '16px',
                      height: 16,
                      fontSize: '0.8em',
                      paddingLeft: 2,
                      paddingRight: 2,
                    }}
                  >
                    {recording.format}
                  </div>
                  <div
                    style={{
                      border: `2px solid ${theme.palette.text.secondary}`,
                      borderRadius: 2,
                      height: 16,
                      lineHeight: '16px',
                      fontSize: '0.8em',
                      textAlign: 'center',
                      marginLeft: 4,
                      paddingLeft: 2,
                      paddingRight: 2,
                    }}
                  >
                    {recording.channels === 1 ? 'Mono' : 'Stereo'}
                  </div>
                </div>
              )}
            </div>
          }
          secondary={
            selected && (
              <Grow in={true}>
                <div>
                  <div>
                    <Typography variant="caption">
                      {`Recorded: ${dayjs(recording.created).format(
                        'MMM Do YYYY, h:mm A'
                      )}`}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="caption" aria-hidden="true">
                      Duration:
                      {' ' + msToTime(Math.trunc(duration * 1000))}
                    </Typography>
                    <Typography variant="srOnly">
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

                    <Typography variant="caption">{` - Size: ${prettyBytes(
                      recording.size
                    )}`}</Typography>
                  </div>
                </div>
              </Grow>
            )
          }
        />
        <div
          style={{
            opacity: hovered ? 1 : 0,
            transition: 'opacity .3s ease-in-out',
          }}
        >
          {!isPlaying && <PlayButton handlePlay={handlePlay} />}
        </div>
        {isPlaying && <StopButton handleStop={handleStop} />}
        <IconButton
          data-testid="button_recording-options"
          aria-label="Options"
          aria-haspopup="true"
          onClick={handleClickMenu}
        >
          <MoreVertIcon />
        </IconButton>

        <Menu
          id="recording-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
        >
          <MenuItem
            data-testid="option_view-recording"
            dense
            onClick={() => handleSelectViewRecording(recording._id)}
          >
            View Recording
          </MenuItem>
          <MenuItem
            data-testid="option_download-recording"
            dense
            onClick={() => handleSelectDownloadRecording(recording._id)}
          >
            Download
          </MenuItem>
          <MenuItem
            style={{ color: 'red' }}
            data-testid="option_delete-recording"
            dense
            onClick={() => handleSelectDelete(recording._id)}
          >
            Delete
          </MenuItem>
        </Menu>
        <audio id={recording._id}>
          <source src={'tapes://' + recording.location} />
          <source src={recording.remoteLocation + `?token=${bucketToken}`} />
        </audio>
      </ListItem>
      {playing && (
        <LinearProgress
          ref={progressRef}
          variant="determinate"
          value={(curTime / duration) * 100}
          onClick={handleProgressClick}
        />
      )}
    </>
  );
}

// const mapStateToProps = (state: RecorderState) => {
//   return { playing: state.playing };
// };

// export default connect(mapStateToProps, actions)(RecordingsListItem);
export default RecordingsListItem;
