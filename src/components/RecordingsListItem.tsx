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
import Typography from '@material-ui/core/Typography';
import Grow from '@material-ui/core/Grow';

interface RecordingsListItemProps {
  recording: Recording;
  selectedRecording: string;
  handleSelectRecording(recordingId: string): void;
  handleDeleteRecording(recordingId: string): void;
}

export function RecordingsListItem({
  recording,
  selectedRecording,
  handleSelectRecording,
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
    <ListItem
      key={recording.id}
      divider
      selected={selectedRecording === recording.id}
      onClick={() => handleSelectRecording(recording.id)}
    >
      <ListItemText
        disableTypography={true}
        primary={<Typography>{recording.title}</Typography>}
        secondary={
          selectedRecording === recording.id && (
            <Grow in={true}>
              <>
                <Typography variant="body2">
                  {`${recording.created.toLocaleDateString()} ${recording.created.toLocaleTimeString()}`}
                </Typography>
                <Typography variant="body2">{`Size: ${prettyBytes(
                  recording.size
                )}`}</Typography>
              </>
            </Grow>
          )
        }
      />
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
    </ListItem>
  );
}

export default connect(null, actions)(RecordingsListItem);
