import React, { ReactElement, useState } from 'react';
import { connect } from 'react-redux';
import * as actions from '../store/actions';
import prettyBytes from 'pretty-bytes';
import { Recording } from '../common/Recording.interface';
import useHover from '../hooks/useHover';
import { RecorderState } from '../store/types';

import PlayButton from './PlayButton';
import PauseButton from './PauseButton';

import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import Grow from '@material-ui/core/Grow';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

interface RecordingsListItemProps {
  recording: Recording;
  selectedRecording: string;
  playing: string;
  handleSelectRecording(recordingId: string): void;
  handleDeleteRecording(recordingId: string): void;
  playRecording(recordingId: string): void;
  pauseRecording(): void;
}

export function RecordingsListItem({
  recording,
  selectedRecording,
  playing,
  handleSelectRecording,
  handleDeleteRecording,
  playRecording,
  pauseRecording,
}: RecordingsListItemProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState(null);
  // const [playing, setPlaying] = useState(false);
  const [hoverRef, hovered] = useHover();
  const selected = selectedRecording === recording.id;
  const isPlaying = playing === recording.id;

  const handlePlay = () => {
    // setPlaying(true);
    playRecording(recording.id);
    console.log('Play!', recording.id);
  };

  const handlePause = () => {
    // setPlaying(false);
    pauseRecording();
    console.log('Pause!');
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = (recordingId: string) => {
    setAnchorEl(null);
    handleDeleteRecording(recordingId);
  };

  return (
    <ListItem
      style={{
        cursor: 'pointer',
        maxHeight: selected ? 76 + 8 : 48 + 8,
        transition: 'max-height 3 ease-in-out',
      }}
      ref={hoverRef}
      key={recording.id}
      divider
      selected={selected}
      onClick={() => handleSelectRecording(recording.id)}
    >
      <ListItemText
        disableTypography={true}
        primary={<Typography>{recording.title}</Typography>}
        secondary={
          selected && (
            <Grow in={true}>
              <div>
                <Typography variant="body2">
                  {`${recording.created.toLocaleDateString()} ${recording.created.toLocaleTimeString()}`}
                </Typography>
                <Typography variant="body2">{`Size: ${prettyBytes(
                  recording.size
                )}`}</Typography>
              </div>
            </Grow>
          )
        }
      />
      <div
        style={{
          visibility: hovered ? 'visible' : 'hidden',
          opacity: hovered ? 1 : 0,
          transition: 'opacity .3s ease-in-out',
        }}
      >
        {!isPlaying && <PlayButton handlePlay={handlePlay} />}
      </div>
      {isPlaying && <PauseButton handlePause={handlePause} />}
      <IconButton data-testid="button_recording-options" onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>

      <Menu
        id="recording-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem
          data-testid="option_delete-recording"
          dense
          onClick={() => handleDelete(recording.id)}
        >
          Delete
        </MenuItem>
      </Menu>
      <audio src={recording.location}></audio>
    </ListItem>
  );
}

const mapStateToProps = (state: RecorderState) => {
  return { playing: state.playing };
};

export default connect(mapStateToProps, actions)(RecordingsListItem);
