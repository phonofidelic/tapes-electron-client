import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { HashRouter as Router } from 'react-router-dom';

import { store } from '@/store/index';
import { theme } from '@/theme';
import { ConnectionProvider } from './contexts/OrbitdbConnectionContext';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <ConnectionProvider>
      <Provider store={store}>
        <Router>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
          </StyledEngineProvider>
        </Router>
      </Provider>
    </ConnectionProvider>
  );
}
