import React, { ReactElement } from 'react';

import IconButton from '@mui/material/IconButton';
import StopIcon from '@mui/icons-material/Stop';

interface Props {
  handleStop(): void;
}

export default function StopButton({ handleStop }: Props): ReactElement {
  return (
    <IconButton data-testid="button_pause-recording" onClick={handleStop} size="large">
      <StopIcon />
    </IconButton>
  );
}
