import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { TextileProvider } from './services/TextileProvider';

import { store } from './store';
import { theme } from './theme';
import { BrowserRouter as Router } from 'react-router-dom';

import { db } from './db';

// db.init();

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
        <TextileProvider>
          <Router>{children}</Router>
        </TextileProvider>
      </MuiThemeProvider>
    </Provider>
  );
}
