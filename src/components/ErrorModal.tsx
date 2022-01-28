import React, { ReactElement } from 'react';
import { useTheme } from '@mui/material';
import Button from '@mui/material/Button';

interface Props {
  error: Error;
  onConfirmError(): void;
}

export default function ErrorModal({
  error,
  onConfirmError,
}: Props): ReactElement {
  const theme = useTheme();

  if (error)
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: 'rgba(0, 0, 0, .8)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: theme.zIndex.appBar + 1,
        }}
      >
        <div
          style={{
            flex: 1,
            width: '100%',
            color: '#fff',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {error?.message}
        </div>
        <div style={{ textAlign: 'right' }}>
          <Button
            style={{ color: '#fff', borderColor: '#fff', margin: 8 }}
            variant="outlined"
            onClick={onConfirmError}
          >
            Ok
          </Button>
        </div>
      </div>
    );

  return null;
}
