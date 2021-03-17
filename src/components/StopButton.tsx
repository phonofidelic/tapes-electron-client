import React, { ReactElement } from 'react';

import IconButton from '@material-ui/core/IconButton';
import StopIcon from '@material-ui/icons/Stop';

interface Props {
  handleStop(): void;
}

export default function StopButton({ handleStop }: Props): ReactElement {
  return (
    <IconButton data-testid="button_pause-recording" onClick={handleStop}>
      <StopIcon />
    </IconButton>
  );
}
