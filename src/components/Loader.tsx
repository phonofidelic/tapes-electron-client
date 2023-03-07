import React from 'react';
import { connect } from 'react-redux';
import { RecorderState } from '../store/types';

import Fade from '@mui/material/Fade';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material';

interface LoaderProps {
  loading: boolean;
  loadingMessage: string | null;
}

export function Loader({ loading, loadingMessage }: LoaderProps) {
  const theme = useTheme();

  return (
    <Fade in={loading}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          height: `calc(100vh - ${theme.dimensions.Navigation.height}px)`,
          textAlign: 'center',
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <CircularProgress />
        </div>
        <div>{loadingMessage}</div>
      </div>
    </Fade>
  );
}

const mapStateToProps = (state: RecorderState) => {
  return {
    loading: state.loading,
    loadingMessage: state.loadingMessage,
  };
};

export default connect(mapStateToProps, null)(Loader);
