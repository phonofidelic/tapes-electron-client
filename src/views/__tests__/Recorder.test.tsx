import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { theme } from '../../theme';
import { RecorderState } from '../../store/types';
import { initialState } from '../../store/reducer';
import { store } from '../../store';
import Recorder from '../Recorder';
import OrbitConnection from '@/db/OrbitConnection';
import { OrbitConnectionContext } from '@/contexts/OrbitdbConnectionContext';
import { RecordingsProvider } from '@/contexts/RecordingsContext';

jest.mock('@/db/Repository', () => ({
  RecordingRepository: jest.fn(),
}));

const renderMockedComponent = (
  ui: React.ReactNode,
  { connection, state }: { connection: OrbitConnection; state: RecorderState }
) => {
  const mockStore = createStore(() => state);

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
  //@ts-ignore
  global.navigator.mediaDevices = { getUserMedia: jest.fn() };
  global.window.AudioContext = jest.fn().mockImplementation(() => {
    return {
      destination: {
        disconnect: jest.fn(),
      },
      createAnalyser: jest.fn().mockImplementation(() => {
        return {
          connect: jest.fn(),
          disconnect: jest.fn(),
          getByteFrequencyData: jest.fn(),
          getByteTimeDomainData: jest.fn(),
        };
      }),
      createMediaStreamSource: jest.fn().mockImplementation(() => {
        return {
          connect: jest.fn(),
          disconnect: jest.fn(),
        };
      }),
      close: jest.fn(),
    };
  });
});

it('renders the Recorder', () => {
  const mockConnection = { connect: jest.fn(), initialized: true };
  const mockState = {
    ...initialState,
    isRecording: false,
  };
  const { getByText } = renderMockedComponent(<Recorder />, {
    connection: mockConnection as unknown as OrbitConnection,
    state: mockState,
  });

  expect(getByText(/rec/i)).toBeVisible();
});

// it('shows a recording  indicator when recording', () => {
//   const mockConnection = { connect: jest.fn(), initialized: true };
//   const mockState = {
//     ...initialState,
//     isRecording: true,
//   };
//   const { getByText } = renderMockedComponent(<Recorder />, {
//     connection: mockConnection as unknown as OrbitConnection,
//     state: mockState,
//   });

//   expect(getByText(/recording/i)).toBeVisible();
// });
