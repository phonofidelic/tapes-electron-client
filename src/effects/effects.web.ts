import { ThunkAction } from 'redux-thunk';
import {
  pauseRecording,
  cacheRecordingRequest,
  playRecording,
  cacheRecordingSuccess,
} from '../store/actions';
import { Recording } from '../common/Recording.interface';
import { RecorderState, RecorderAction } from '../store/types';

type Effect = ThunkAction<void, RecorderState, unknown, RecorderAction>;

export const setInputDevice =
  (deviceName: string): Effect =>
  async (dispatch) => {
    console.log('TODO: implement setInputDevice for web');
  };

export const downloadRecording =
  (recordingId: string): Effect =>
  async (dispatch) => {
    console.log('TODO: implement downloadRecording for web');
  };

export const cacheAndPlayRecording =
  (recording: Recording): Effect =>
  async (dispatch) => {
    dispatch(pauseRecording());
    dispatch(cacheRecordingRequest(recording));
    dispatch(cacheRecordingSuccess());
    dispatch(playRecording());
  };

export const getRecordingStorageStatus =
  (recordingCid: string): Effect =>
  async (dispatch) => {
    console.log('TODO: implement getRecordingStorageStatus for web');
  };
