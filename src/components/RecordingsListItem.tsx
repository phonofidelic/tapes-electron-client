import React, { ReactElement, useState } from 'react';
import { useHistory } from 'react-router-dom';
import prettyBytes from 'pretty-bytes';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import dayjsDuration from 'dayjs/plugin/duration';
import { Recording } from '../common/Recording.interface';
import useHover from '../hooks/useHover';
import { msToTime } from '../utils';

import PlayButton from './PlayButton';
import EditableText from './EditableText';

import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Grow from '@mui/material/Grow';

import { useTheme } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import { CircularProgress, Tooltip } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(dayjsDuration);

interface RecordingsListItemProps {
  recording: Recording;
  selectedRecording: Recording;
  currentPlayingId: string;
  caching: boolean;
  playing: boolean;
  handleSelectRecording(recording: Recording): void;
  handleDeleteRecording(recordingId: string): void;
  handleEditRecording(recordingId: string, update: any): void;
  handleDownloadRecording(recordingId: string): void;
  handleCacheAndPlayRecording(recording: Recording): void;
}

export function RecordingsListItem({
  recording,
  selectedRecording,
  currentPlayingId,
  caching,
  playing,
  handleSelectRecording,
  handleDeleteRecording,
  handleEditRecording,
  handleDownloadRecording,
  handleCacheAndPlayRecording,
}: RecordingsListItemProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState(null);
  const [hoverRef, hovered] = useHover();
  const history = useHistory();
  const theme = useTheme();
  const selected = selectedRecording?._id === recording._id;
  const duration = recording.duration;
  const durationObj = dayjs.duration(duration);

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

  const handleSubimtTitleChange = (newTitle: string) => {
    newTitle &&
      newTitle !== recording.title &&
      handleEditRecording(recording._id, { title: newTitle });
  };

  const handleOpenDetailView = (recordingId: string) => {
    history.push({ pathname: `/library/${recordingId}`, state: recording });
  };

  return (
    <ListItem
      data-testid={`recording-list-item_${recording._id}`}
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
      selected={selected}
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
            <EditableText
              textValue={recording.title}
              size="small"
              onChangeCommitted={handleSubimtTitleChange}
            >
              <Tooltip title={recording.title} enterDelay={400}>
                <Typography style={{ maxWidth: '50vw' }} noWrap>
                  {recording.title}
                </Typography>
              </Tooltip>
            </EditableText>
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

                  <Typography variant="caption">{` - Size: ${
                    typeof recording.size === 'number'
                      ? prettyBytes(recording.size)
                      : recording.size
                  }`}</Typography>
                </div>
              </div>
            </Grow>
          )
        }
      />
      <div
        style={{
          opacity: hovered || recording._id === currentPlayingId ? 1 : 0,
          transition: 'opacity .3s ease-in-out',
        }}
      >
        <div style={{ position: 'relative' }}>
          {playing && recording._id === currentPlayingId ? (
            <IconButton size="large" disabled>
              <VolumeUpIcon data-testid="current-playing-indicator" />
            </IconButton>
          ) : (
            <PlayButton
              // data-testid={`play-button_${recording._id}`}
              handlePlay={() => handleCacheAndPlayRecording(recording)}
            />
          )}
          {caching && recording._id === currentPlayingId && (
            <CircularProgress
              style={{
                position: 'absolute',
                top: 4,
                left: 4,
              }}
            />
          )}
        </div>
      </div>
      <IconButton
        data-testid="button_recording-options"
        aria-label="Options"
        aria-haspopup="true"
        onClick={handleClickMenu}
        size="large"
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
    </ListItem>
  );
}

export default RecordingsListItem;
