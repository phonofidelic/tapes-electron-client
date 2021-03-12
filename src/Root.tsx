import React from 'react';
import { Provider } from 'react-redux';
import { MuiThemeProvider } from '@material-ui/core/styles';

import { store } from './store';
import { theme } from './theme';
import { BrowserRouter as Router } from 'react-router-dom';

export default function Root({ children }: { children: React.ReactElement }) {
  return (
    <Provider store={store}>
      <MuiThemeProvider theme={theme}>
        <Router>{children}</Router>
      </MuiThemeProvider>
    </Provider>
  );
}
