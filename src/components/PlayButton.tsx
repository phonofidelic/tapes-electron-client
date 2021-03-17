import React, { ReactElement } from 'react';

import IconButton from '@material-ui/core/IconButton';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

interface Props {
  handlePlay(): void;
}

export default function PlayButton({ handlePlay }: Props): ReactElement {
  return (
    <IconButton data-testid="button_play-recording" onClick={handlePlay}>
      <PlayArrowIcon />
    </IconButton>
  );
}
