import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent } from '@testing-library/react';
import dayjs from 'dayjs';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import dayjsDuration from 'dayjs/plugin/duration';
import { Recording } from '../../common/Recording.interface';
import { RecordingsListItem } from '../RecordingsListItem';
import { RecordingFormats } from '../../common/RecordingFormats.enum';
import { RecorderState } from '../../store/types';
import { initialState } from '../../store/reducer';

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(dayjsDuration);

const mockDate = new Date().toISOString();
const mockRecording: Recording = {
  _id: '123',
  location: 'fdefafafaf',
  title: 'Mock recording',
  size: 1234,
  created: mockDate,
  filename: '8g7i8fi7f7fi7ftituf76',
  format: 'mp3' as RecordingFormats,
  channels: 2,
};

let mockSelect: (recording: Recording) => void;
let mockDelete: (recordingId: string) => void;
let mockEdit: (recordingId: string) => void;
let mockDownload: (recordingId: string) => void;
let mockPlay: (recording: Recording) => void;
beforeEach(() => {
  mockSelect = jest.fn();
  mockDelete = jest.fn();
  mockEdit = jest.fn();
  mockDownload = jest.fn();
  mockPlay = jest.fn();

  /**
   * https://github.com/jsdom/jsdom/issues/2155#issuecomment-366703395
   * */
  window.HTMLMediaElement.prototype.pause = () => {
    /* do nothing */
  };
  window.HTMLMediaElement.prototype.load = () => {
    /* do nothing */
  };
});

const renderMockedComponent = (state: RecorderState) => {
  const mockStore = createStore(() => state);

  return render(
    <Provider store={mockStore}>
      <RecordingsListItem
        recording={mockRecording}
        selectedRecording={state.selectedRecording}
        currentPlayingId={mockRecording._id}
        caching={state.caching}
        playing={state.playing}
        handleSelectRecording={mockSelect}
        handleDeleteRecording={mockDelete}
        handleEditRecording={mockEdit}
        handleDownloadRecording={mockDownload}
        handleCacheAndPlayRecording={mockPlay}
      />
    </Provider>
  );
};

it('displays the default list item', () => {
  const { getByText } = renderMockedComponent(initialState);

  expect(getByText('Mock recording')).toBeInTheDocument();
});

it('displays detail info when selected', () => {
  const { getByText } = renderMockedComponent({
    ...initialState,
    selectedRecording: mockRecording,
  });

  expect(
    getByText(
      `Recorded: ${dayjs(mockRecording.created).format('MMM Do YYYY, h:mm A')}`
    )
  ).toBeInTheDocument();

  expect(getByText(/Size: 1.23 kb/i)).toBeInTheDocument();
});

it.todo('Recording list items should have a playback button');

it('shows a play button when hovered', async () => {
  const { getByTestId, findByTestId } = renderMockedComponent({
    ...initialState,
  });

  fireEvent.mouseOver(getByTestId(`recording-list-item_${mockRecording._id}`));

  expect(await findByTestId(`play-button`)).toBeInTheDocument();
});

it('indicates when it is playing', () => {
  const { getByTestId } = renderMockedComponent({
    ...initialState,
    currentPlaying: mockRecording,
    playing: true,
  });

  expect(getByTestId('current-playing-indicator')).toBeInTheDocument();
});
