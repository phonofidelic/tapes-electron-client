import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent } from '@testing-library/react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { RecorderState } from '../../store/types';
import { initialState } from '../../store/reducer';
import { store } from '../../store';
import Storage from '../Storage';

const renderComponent = () =>
  render(
    <Provider store={store}>
      <Storage />
    </Provider>
  );

const renderMockedComponent = (state: RecorderState) => {
  const mockStore = createStore(() => state);

  return render(
    <Provider store={mockStore}>
      <Storage />
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

it.todo('shows a default empty message');

it.todo('shows a recording item');
