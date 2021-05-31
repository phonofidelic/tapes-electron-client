import React from 'react';
import { Provider } from 'react-redux';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { BrowserRouter as Router } from 'react-router-dom';

import { store } from './store';
import { theme } from './theme';

export default function Root({ children }: { children: React.ReactElement }) {
  return (
    <Provider store={store}>
      <MuiThemeProvider theme={theme}>
        <Router>{children}</Router>
      </MuiThemeProvider>
    </Provider>
  );
}
