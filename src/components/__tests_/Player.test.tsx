import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent } from '@testing-library/react';
import { Player } from '../Player';
import {
  RecorderState,
  PlayRecordingAction,
  PauseRecordingAction,
  SetSeekedTimeAction,
} from '../../store/types';
import { initialState } from '../../store/reducer';
import { Recording } from '../../common/Recording.interface';
import { RecordingFormats } from '../../common/RecordingFormats.enum';

const mockDate = new Date();
const mockRecording: Recording = {
  _id: '123',
  location: 'fdefafafaf',
  title: 'Mock recording',
  size: 1234,
  created: mockDate.toISOString(),
  filename: '8g7i8fi7f7fi7ftituf76',
  format: 'mp3' as RecordingFormats,
  channels: 2,
};

let mockPlayRecording: () => PlayRecordingAction;
let mockPauseRecording: () => PauseRecordingAction;
let mockSetSeekedTime: (time: number) => SetSeekedTimeAction;

beforeEach(() => {
  mockPlayRecording = jest.fn();
  mockPauseRecording = jest.fn();
  mockSetSeekedTime = jest.fn();
});

const renderMockedComponent = (state: RecorderState) => {
  return render(
    <Player
      playing={state.playing}
      currentPlaying={state.currentPlaying}
      currentTime={state.currentTime}
      caching={state.caching}
      playRecording={mockPlayRecording}
      pauseRecording={mockPauseRecording}
      setSeekedTime={mockSetSeekedTime}
    />
  );
};

it('displays information on the currently playing recording', () => {
  const { getByText } = renderMockedComponent({
    ...initialState,
    currentPlaying: mockRecording,
  });

  expect(getByText(mockRecording.title)).toBeInTheDocument();
});

it('shows a pause button when playing', () => {
  const { getByTestId } = renderMockedComponent({
    ...initialState,
    playing: true,
    currentPlaying: mockRecording,
  });

  expect(getByTestId('pause-button')).toBeInTheDocument();
});

it('shows a play button when not playing', () => {
  const { getByTestId } = renderMockedComponent({
    ...initialState,
    playing: false,
    currentPlaying: mockRecording,
  });

  expect(getByTestId('play-button')).toBeInTheDocument();
});
