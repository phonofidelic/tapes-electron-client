import {
  START_MONITOR,
  StartMonitorAction,
  STOP_MONITOR,
  StopMonitorAction,
  START_RECORDING_REQUEST,
  StartRecordingRequestAction,
  START_RECORDING_SUCCESS,
  StartRecordingSuccessAction,
  START_RECORDING_FAILURE,
  StartRecordingFailureAction,
  STOP_RECORDING_REQUEST,
  StopRecordingRequestAction,
  LOAD_RECORDINGS_REQUEST,
  LoadRecordingsRequestAction,
  LOAD_RECORDINGS_SUCCESS,
  LoadRecordingsuccessAction,
  LOAD_RECORDINGS_FAILURE,
  LoadRecordingsFailureAction,
  DELETE_RECORDING_REQUEST,
  DeleteRecordingRequestAction,
  DELETE_RECORDING_SUCCESS,
  DeleteRecordingSuccessAction,
  DELETE_RECORDING_FAILURE,
  DeleteRecordingFailureAction,
  StopRecordingSuccessAction,
  STOP_RECORDING_SUCCESS,
  StopRecordingFailureAction,
  STOP_RECORDING_FAILURE,
  PlayRecordingAction,
  PLAY_RECORDING,
  PauseRecordingAction,
  PAUSE_RECORDING,
  GetBucketInfoRequestAction,
  GET_BUCKET_DATA_REQUEST,
  GetBucketInfoSuccessAction,
  GET_BUCKET_DATA_SUCCESS,
  GetBucketInfoFailureAction,
  GET_BUCKET_DATA_FAILURE,
} from './types';
import { Recording } from '../common/Recording.interface';

// export const startMonitor = (): AppThunk => async (dispatch) => {
//   dispatch({})
// }

export function startMonitor(): StartMonitorAction {
  return {
    type: START_MONITOR,
  };
}

export function stopMonitor(): StopMonitorAction {
  return {
    type: STOP_MONITOR,
  };
}

export function startRecordingRequest(): StartRecordingRequestAction {
  return {
    type: START_RECORDING_REQUEST,
  };
}

export function startRecordingSuccess(
  recordingData: Recording
): StartRecordingSuccessAction {
  return {
    type: START_RECORDING_SUCCESS,
    payload: recordingData,
  };
}

export function startRecordingFailure(
  error: Error
): StartRecordingFailureAction {
  return {
    type: START_RECORDING_FAILURE,
    payload: error,
  };
}

export function stopRecordingRequest(): StopRecordingRequestAction {
  return {
    type: STOP_RECORDING_REQUEST,
  };
}

export function stopRecordingSuccess(): StopRecordingSuccessAction {
  return {
    type: STOP_RECORDING_SUCCESS,
  };
}

export function stopRecordingFailure(error: Error): StopRecordingFailureAction {
  return {
    type: STOP_RECORDING_FAILURE,
    payload: error,
  };
}

export function loadRecordingsRequest(): LoadRecordingsRequestAction {
  return {
    type: LOAD_RECORDINGS_REQUEST,
  };
}

export function loadRecordingsSuccess(
  recordings: Recording[]
): LoadRecordingsuccessAction {
  return {
    type: LOAD_RECORDINGS_SUCCESS,
    payload: recordings,
  };
}

export function loadRecordingsFailure(
  error: Error
): LoadRecordingsFailureAction {
  return {
    type: LOAD_RECORDINGS_FAILURE,
    payload: error,
  };
}

export function deleteRecordingRequest(
  recordingId: string
): DeleteRecordingRequestAction {
  return {
    type: DELETE_RECORDING_REQUEST,
    payload: recordingId,
  };
}

export function deleteRecordingSuccess(
  recordingId: string
): DeleteRecordingSuccessAction {
  return {
    type: DELETE_RECORDING_SUCCESS,
    payload: recordingId,
  };
}

export function deleteRecordingFailure(
  error: Error
): DeleteRecordingFailureAction {
  return {
    type: DELETE_RECORDING_FAILURE,
    payload: error,
  };
}

export function playRecording(recordingId: string): PlayRecordingAction {
  return {
    type: PLAY_RECORDING,
    payload: recordingId,
  };
}

export function pauseRecording(): PauseRecordingAction {
  return {
    type: PAUSE_RECORDING,
  };
}

export function getBucketInfoRequest(): GetBucketInfoRequestAction {
  return {
    type: GET_BUCKET_DATA_REQUEST,
  };
}

export function getBucketInfoSuccess(
  bucketInfo: any
): GetBucketInfoSuccessAction {
  return {
    type: GET_BUCKET_DATA_SUCCESS,
    payload: bucketInfo,
  };
}

export function getBucketInfoFailure(error: Error): GetBucketInfoFailureAction {
  return {
    type: GET_BUCKET_DATA_FAILURE,
    payload: error,
  };
}
