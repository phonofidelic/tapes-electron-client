import React, { ReactElement } from 'react';

import IconButton from '@material-ui/core/IconButton';
import PauseIcon from '@material-ui/icons/Pause';

interface Props {
  handlePause(): void;
}

export default function PlayButton({ handlePause }: Props): ReactElement {
  return (
    <IconButton data-testid="button_pause-recording" onClick={handlePause}>
      <PauseIcon />
    </IconButton>
  );
}
