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

const mockDate = new Date();
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
beforeEach(() => {
  mockSelect = jest.fn();
  mockDelete = jest.fn();
  mockEdit = jest.fn();
  mockDownload = jest.fn();

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
        selectedRecording={mockStore.getState().selectedRecording}
        caching={mockStore.getState().caching}
        handleSelectRecording={mockSelect}
        handleDeleteRecording={mockDelete}
        handleEditRecording={mockEdit}
        handleDownloadRecording={mockDownload}
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
