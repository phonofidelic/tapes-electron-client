import React, { ReactElement, useState } from 'react';
import { connect } from 'react-redux';
import * as actions from '../store/actions';
import prettyBytes from 'pretty-bytes';
import { Recording } from '../common/Recording.interface';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';

interface RecordingsListItemProps {
  recording: Recording;
  handleDeleteRecording(recordingId: string): void;
}

export function RecordingsListItem({
  recording,
  handleDeleteRecording,
}: RecordingsListItemProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState(null);

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
    <ListItem key={recording.id} divider>
      <ListItemText
        primary={recording.title}
        secondary={`Recorded: ${recording.created.toLocaleDateString()} - Size: ${prettyBytes(
          recording.size
        )}`}
      />
      <IconButton data-testid="button_recording-options" onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="simple-menu"
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
    </ListItem>
  );
}

export default connect(null, actions)(RecordingsListItem);
