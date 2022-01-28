import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent } from '@testing-library/react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { ThemeProvider, Theme, StyledEngineProvider } from '@mui/material/styles';
import { theme } from '../../theme';
import { RecorderState } from '../../store/types';
import { initialState } from '../../store/reducer';
import { store } from '../../store';
import Recorder from '../Recorder';

const renderComponent = () =>
  render(
    <Provider store={store}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Recorder />
        </ThemeProvider>
      </StyledEngineProvider>
    </Provider>
  );

const renderMockedComponent = (state: RecorderState) => {
  const mockStore = createStore(() => state);

  return render(
    <Provider store={mockStore}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Recorder />
        </ThemeProvider>
      </StyledEngineProvider>
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
  const { getByText } = renderComponent();

  expect(getByText(/rec/i)).toBeVisible();
});

it('shows a recording  indicator when recording', () => {
  const { getByText } = renderMockedComponent({
    ...initialState,
    isRecording: true,
  });

  expect(getByText(/recording/i)).toBeVisible();
});
