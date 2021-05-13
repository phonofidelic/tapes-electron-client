import React from 'react';
import { connect } from 'react-redux';
import { RecorderState } from '../store/types';

import Fade from '@material-ui/core/Fade';
import CircularProgress from '@material-ui/core/CircularProgress';

interface LoaderProps {
  loading: boolean;
  loadingMessage: string | null;
}

export function Loader({ loading, loadingMessage }: LoaderProps) {
  return (
    <Fade in={loading}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          height: '100vh',
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
