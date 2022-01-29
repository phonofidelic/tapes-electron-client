import React, { ReactElement } from 'react';

import IconButton from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { CircularProgress } from '@mui/material';

interface Props {
  loading?: boolean;
  handlePlay(): void;
}

export default function PlayButton({
  loading,
  handlePlay,
}: Props): ReactElement {
  return (
    <div style={{ position: 'relative' }}>
      <IconButton
        data-testid="button_play-recording"
        aria-label="Play recording"
        onClick={handlePlay}
        size="large"
      >
        <PlayArrowIcon />
      </IconButton>
      {loading && (
        <CircularProgress
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
          }}
        />
      )}
    </div>
  );
}

export function A11yPlayButton({ handlePlay }: Props): ReactElement {
  return (
    <IconButton
      data-testid="a11ly_button_play-recording"
      onClick={handlePlay}
      size="large"
      style={{ position: 'relative' }}
    >
      <PlayArrowIcon />
    </IconButton>
  );
}
