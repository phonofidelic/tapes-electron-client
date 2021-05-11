import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { BrowserRouter as Router } from 'react-router-dom';

import { store } from './store';
import { theme } from './theme';
import { db } from './db';

export default function Root({ children }: { children: React.ReactElement }) {
  useEffect(() => {
    const loadDB = async () => {
      await db.init();
    };
    loadDB();
  }, []);
  return (
    <Provider store={store}>
      <MuiThemeProvider theme={theme}>
        <Router>{children}</Router>
      </MuiThemeProvider>
    </Provider>
  );
}
