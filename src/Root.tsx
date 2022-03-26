import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider, Theme, StyledEngineProvider } from '@mui/material/styles';
import { HashRouter as Router } from 'react-router-dom';

import { store } from './store';
import { theme } from './theme';

export default function Root({ children }: { children: React.ReactElement }) {
  return (
    <Provider store={store}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Router>{children}</Router>
        </ThemeProvider>
      </StyledEngineProvider>
    </Provider>
  );
}
