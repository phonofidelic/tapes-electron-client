import React from 'react';
import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import reduxThunk from 'redux-thunk';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { RecordingFormats } from '../../common/RecordingFormats.enum';
import { RecorderState } from '../../store/types';
import { initialState } from '../../store/reducer';
import Library from '../Library';
import { theme } from '../../theme';
import { OrbitConnectionContext } from '@/contexts/OrbitdbConnectionContext';
import OrbitConnection from '@/db/OrbitConnection';
import { RecordingsProvider } from '@/contexts/RecordingsContext';

const mockRecording = {
  channels: 2,
  created: new Date().toISOString(),
  filename: 'c676d7f077fe24769e027d7692502133.mp3',
  format: RecordingFormats.Wav,
  location: '/path/to/recording/c676d7f077fe24769e027d7692502133.mp3',
  size: 2457600,
  title: 'Test Recording #1',
  _id: '01F3NGJHJG520NG1VKJS7JAR5W',
};

jest.mock('@/db/Repository', () => ({
  RecordingRepository: jest.fn().mockImplementation(() => ({
    find: jest.fn().mockResolvedValue([mockRecording]),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
}));

const renderMockedComponent = (
  ui: React.ReactNode,
  { connection, state }: { connection: OrbitConnection; state: RecorderState }
) => {
  const mockStore = createStore(
    () => state,
    initialState,
    applyMiddleware(reduxThunk)
  );

  return render(
    <Provider store={mockStore}>
      <OrbitConnectionContext.Provider value={connection}>
        <RecordingsProvider>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>{ui}</ThemeProvider>
          </StyledEngineProvider>
        </RecordingsProvider>
      </OrbitConnectionContext.Provider>
    </Provider>
  );
};

beforeEach(() => {
  /*
   * Mock HTMLAudioElement used in useAudioPreview hook.
   */
  global.document.getElementById = jest.fn().mockImplementation(() => {
    return {
      pause: jest.fn(),
      load: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
  });

  Storage.prototype.setItem = jest.fn();
  Storage.prototype.getItem = jest.fn();
});

// it('shows a default empty message', async () => {
//   const mockState = {
//     ...initialState,
//     bucketToken: 'abc123',
//   };
//   const mockConnection = {
//     connect: jest.fn(),
//     initialized: false,
//   };

//   const { getByText } = renderMockedComponent(<Library />, {
//     connection: mockConnection as unknown as OrbitConnection,
//     state: mockState,
//   });

//   await waitFor(
//     () => expect(getByText(/your recordings will live here/i)).toBeVisible(),
//     { timeout: 2000 }
//   );
// });

it('shows a recording item', async () => {
  const mockState = {
    ...initialState,
    bucketToken: 'abc123',
    recordings: [mockRecording],
  };
  const mockConnection = {
    connect: jest.fn(),
    initialized: true,
  };

  const { getByText } = renderMockedComponent(<Library />, {
    connection: mockConnection as unknown as OrbitConnection,
    state: mockState,
  });

  await waitFor(() => expect(getByText(/Test Recording #1/i)).toBeVisible(), {
    timeout: 2000,
  });
});
