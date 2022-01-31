import React, { ReactElement } from 'react';

import IconButton from '@mui/material/IconButton';
import PauseIcon from '@mui/icons-material/Pause';

interface Props {
  handlePause(): void;
}

export default function PlayButton({ handlePause }: Props): ReactElement {
  return (
    <IconButton data-testid="pause-button" onClick={handlePause} size="large">
      <PauseIcon />
    </IconButton>
  );
}
