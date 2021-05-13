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
  ADD_RECORDING_REQUEST,
  AddRecordingRequestAction,
  ADD_RECORDING_SUCCESS,
  AddRecordingSuccessAction,
  ADD_RECORDING_FAILURE,
  AddRecordingFailureAction,
  EDIT_RECORDING_REQUEST,
  EditRecordingRequestAction,
  EDIT_RECORDING_SUCCESS,
  EditRecordingSuccessAction,
  EDIT_RECORDING_FAILURE,
  EditRecordingFailureAction,
  LOAD_RECORDINGS_REQUEST,
  LoadRecordingsRequestAction,
  LOAD_RECORDINGS_SUCCESS,
  LoadRecordingsSuccessAction,
  LOAD_RECORDINGS_FAILURE,
  LoadRecordingsFailureAction,
  DELETE_RECORDING_REQUEST,
  DeleteRecordingRequestAction,
  DELETE_RECORDING_SUCCESS,
  DeleteRecordingSuccessAction,
  DELETE_RECORDING_FAILURE,
  DeleteRecordingFailureAction,
  STOP_RECORDING_SUCCESS,
  StopRecordingSuccessAction,
  STOP_RECORDING_FAILURE,
  StopRecordingFailureAction,
  PLAY_RECORDING,
  PlayRecordingAction,
  PAUSE_RECORDING,
  PauseRecordingAction,
  GET_BUCKET_TOKEN_REQUEST,
  GetBucketTokenRequestAction,
  GET_BUCKET_TOKEN_SUCCESS,
  GetBucketTokenSuccessAction,
  GET_BUCKET_TOKEN_FAILURE,
  GetBucketTokenFailureAction,
  LOAD_ACCOUNT_TOKEN_REQUEST,
  LoadAccountTokenRequestAction,
  LOAD_ACCOUNT_TOKEN_SUCCESS,
  LoadAccountTokenSuccessAction,
  LOAD_ACCOUNT_TOKEN_FAILURE,
  LoadAccountTokenFailureAction,
  SET_RECORDING_SETTINGS,
  SetRecordingSettingsAction,
  SET_LOADING_MESSAGE,
  SettLoadingMessageAction,
} from './types';
import { Recording } from '../common/Recording.interface';
import { RecordingSettings } from '../common/RecordingSettings.interface';
import { ThreadDBDoc } from '../common/TreadDBDoc.interface';

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

export function addRecordingRequest(): AddRecordingRequestAction {
  return {
    type: ADD_RECORDING_REQUEST,
  };
}

export function addRecordingSuccess(
  recording: Recording
): AddRecordingSuccessAction {
  return {
    type: ADD_RECORDING_SUCCESS,
    payload: recording,
  };
}

export function addRecordingFailure(error: Error): AddRecordingFailureAction {
  return {
    type: ADD_RECORDING_FAILURE,
    payload: error,
  };
}

export function editRecordingRequest(): EditRecordingRequestAction {
  return {
    type: EDIT_RECORDING_REQUEST,
  };
}

export function editRecordingSuccess(
  updatedRecording: Recording
): EditRecordingSuccessAction {
  return {
    type: EDIT_RECORDING_SUCCESS,
    payload: updatedRecording,
  };
}

export function editRecordingFailure(error: Error): EditRecordingFailureAction {
  return {
    type: EDIT_RECORDING_FAILURE,
    payload: error,
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
): LoadRecordingsSuccessAction {
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

export function getBucketTokenRequest(): GetBucketTokenRequestAction {
  return {
    type: GET_BUCKET_TOKEN_REQUEST,
  };
}

export function getBucketTokenSuccess(
  bucketToken: any
): GetBucketTokenSuccessAction {
  return {
    type: GET_BUCKET_TOKEN_SUCCESS,
    payload: bucketToken,
  };
}

export function getBucketTokenFailure(
  error: Error
): GetBucketTokenFailureAction {
  return {
    type: GET_BUCKET_TOKEN_FAILURE,
    payload: error,
  };
}

export function loadAccountTokenRequest(): LoadAccountTokenRequestAction {
  return {
    type: LOAD_ACCOUNT_TOKEN_REQUEST,
  };
}

export function loadAccountTokenSuccess(
  identityString: string
): LoadAccountTokenSuccessAction {
  return {
    type: LOAD_ACCOUNT_TOKEN_SUCCESS,
    payload: identityString,
  };
}

export function loadAccountTokenFailure(
  error: Error
): LoadAccountTokenFailureAction {
  return {
    type: LOAD_ACCOUNT_TOKEN_FAILURE,
    payload: error,
  };
}

export function setRecordingSettings(
  recordingSettings: RecordingSettings
): SetRecordingSettingsAction {
  return {
    type: SET_RECORDING_SETTINGS,
    payload: recordingSettings,
  };
}

export function setLoadingMessage(message: string): SettLoadingMessageAction {
  return {
    type: SET_LOADING_MESSAGE,
    payload: message,
  };
}
