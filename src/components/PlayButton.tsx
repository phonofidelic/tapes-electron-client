import React, { ReactElement } from 'react';

import IconButton from '@material-ui/core/IconButton';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

interface Props {
  handlePlay(): void;
}

export default function PlayButton({ handlePlay }: Props): ReactElement {
  return (
    <IconButton
      data-testid="button_play-recording"
      aria-label="Play recording"
      onClick={handlePlay}
    >
      <PlayArrowIcon />
    </IconButton>
  );
}

export function A11yPlayButton({ handlePlay }: Props): ReactElement {
  return (
    <IconButton data-testid="a11ly_button_play-recording" onClick={handlePlay}>
      <PlayArrowIcon />
    </IconButton>
  );
}
