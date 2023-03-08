import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { HashRouter as Router } from 'react-router-dom';

import { store } from '@/store/index';
import { theme } from '@/theme';
import { OrbitConnectionProvider } from '@/contexts/OrbitdbConnectionContext';
import { RecordingsProvider } from '@/contexts/RecordingsContext';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <OrbitConnectionProvider>
        <RecordingsProvider>
          <Router>
            <StyledEngineProvider injectFirst>
              <ThemeProvider theme={theme}>{children}</ThemeProvider>
            </StyledEngineProvider>
          </Router>
        </RecordingsProvider>
      </OrbitConnectionProvider>
    </Provider>
  );
}
