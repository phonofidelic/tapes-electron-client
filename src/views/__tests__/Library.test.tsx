import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import reduxThunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { MuiThemeProvider } from '@material-ui/core/styles';

import { RecordingFormats } from '../../common/RecordingFormats.enum';
import { RecorderState } from '../../store/types';
import { initialState } from '../../store/reducer';
import { store } from '../../store';
import Library from '../Library';
import Root from '../../Root';
import { theme } from '../../theme';

const renderComponent = () =>
  render(
    <Provider store={store}>
      <Library />
    </Provider>
  );

const renderMockedComponent = (state: RecorderState) => {
  // const mockStore = createStore(() => state);
  // const mockStore = configureMockStore([reduxThunk]);
  const mockStore = createStore(
    () => state,
    initialState,
    applyMiddleware(reduxThunk)
  );

  return render(
    <Provider store={mockStore}>
      <MuiThemeProvider theme={theme}>
        <Library />
      </MuiThemeProvider>
    </Provider>
  );
  // return render(
  //   <Root>
  //     <Library />
  //   </Root>
  // );
};

beforeEach(() => {
  /**
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
});

it('shows a default empty message', async () => {
  const { getByText, findByText } = renderMockedComponent({
    ...initialState,
    bucketToken: 'abc123',
  });

  await waitFor(
    () => expect(getByText(/your recordings will live here/i)).toBeVisible(),
    { timeout: 2000 }
  );
});

it('shows a recording item', async () => {
  const mockRecording = {
    bucketPath:
      '/ipfs/bafybeia6sisiwx32kiun5hnxifoi4dxrdxpfgbseb5tt6o42grlnt3keua',
    channels: 2,
    created: new Date(),
    filename: 'c676d7f077fe24769e027d7692502133.mp3',
    format: RecordingFormats.Wav,
    location:
      '/Users/christopherclemons/Projects/tapes-electron-client/Data/c676d7f077fe24769e027d7692502133.mp3',
    remoteLocation:
      'https://hub.textile.io/thread/bafkue5uudcgxzfkurv6ygbla7i4qn4gg26indimhnyunyvlouxm3sey/buckets/bafzbeihp4v2tujypowwg6bgr5e3xktgibnhq2jjhx4icsvlxnfo2znncqa/c676d7f077fe24769e027d7692502133.mp3',
    size: 2457600,
    title: 'Test Recording #1',
    _id: '01F3NGJHJG520NG1VKJS7JAR5W',
  };

  const { getByText, findByText } = renderMockedComponent({
    ...initialState,
    bucketToken: 'abc123',
    recordings: [mockRecording],
  });

  await waitFor(() => expect(getByText(/Test Recording #1/i)).toBeVisible(), {
    timeout: 2000,
  });
});
