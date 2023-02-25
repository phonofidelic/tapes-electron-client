import React from 'react';
import { connect } from 'react-redux';
import { RecorderState } from '../store/types';

import { useTheme } from '@mui/material/styles';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';

type StatusMessageProps = {
  loadingMessage: string | null;
};

export function StatusMessage({ loadingMessage }: StatusMessageProps) {
  const theme = useTheme();

  return (
    <Fade in={Boolean(loadingMessage)}>
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          textAlign: 'center',
          backgroundColor: `rgba(0,0,0, .75)`,
          borderRadius: '8px',
          margin: 8,
          zIndex: theme.zIndex.appBar,
        }}
      >
        <Typography style={{ color: '#fff' }} variant="caption">
          {loadingMessage}
        </Typography>
      </div>
    </Fade>
  );
}

const mapStateToProps = (state: RecorderState) => ({
  loadingMessage: state.loadingMessage,
});

export default connect(mapStateToProps, null)(StatusMessage);
