import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent } from '@testing-library/react';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { RecorderState } from '../../store/types';
import { initialState } from '../../store/reducer';
import { store } from '../../store';
import Recorder from '../Recorder';

const renderComponent = () =>
  render(
    <Provider store={store}>
      <Recorder />
    </Provider>
  );

const renderMockedComponent = (state: RecorderState) => {
  const mockStore = createStore(() => state);

  return render(
    <Provider store={mockStore}>
      <Recorder />
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
          disconnect: jest.fn(),
        };
      }),
      createMediaStreamSource: jest.fn().mockImplementation(() => {
        return {
          disconnect: jest.fn(),
        };
      }),
    };
  });
});

test('renders the Recorder', () => {
  const { getByText } = renderComponent();

  expect(getByText(/rec/i)).toBeVisible();
});

test('shows a recording  indicator when recording', () => {
  const { getByText } = renderMockedComponent({
    ...initialState,
    isRecording: true,
  });

  expect(getByText(/recording/i)).toBeVisible();
});
