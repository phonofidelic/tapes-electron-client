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
  INIT_DATABASE_REQUEST,
  InitDatabaseRequestAction,
  INIT_DATABASE_SUCCESS,
  InitDatabaseSuccessAction,
  INIT_DATABASE_FAILURE,
  InitDatabaseFailureAction,
  SELECT_RECORDING,
  SelectRecordingAction,
  UPLOAD_RECORDINGS_REQUEST,
  UploadRecordingsRequestAction,
  UPLOAD_RECORDINGS_SUCCESS,
  UploadRecordingsSuccessAction,
  UPLOAD_RECORDINGS_FAILURE,
  UploadRecordingsFailureAction,
  SET_INPUT_DEVICE_REQUEST,
  SetInputDeviceRequestAction,
  SET_INPUT_DEVICE_SUCCESS,
  SetInputDeviceSuccessAction,
  SET_INPUT_DEVICE_FAILURE,
  SetInputDeviceFailureAction,
  CONFIRM_ERROR,
  ConfirmErrorAction,
  DOWNLOAD_RECORDING_REQUEST,
  DownloadRecordingRequestAction,
  DOWNLOAD_RECORDING_SUCCESS,
  DownloadRecordingSuccessAction,
  DOWNLOAD_RECORDING_FAILURE,
  DownloadRecordingFailreAction,
  CACHE_RECORDING_REQUEST,
  CachRecordingRequestAction,
  CACHE_RECORDING_SUCCESS,
  CacheRecordingSuccessAction,
  CACHE_RECORDING_FAILURE,
  CacheRecordingFailureAction,
  SetCurrentTimeAction,
  SET_CURRENT_TIME,
  SET_SEEKED_TIME,
  GET_RECORDING_STORAGE_STATUS_REQUEST,
  GetRecordingStorageStatusRequestAction,
  GET_RECORDING_STORAGE_STATUS_SUCCESS,
  GetRecordingStorageStatusSuccessAction,
  GET_RECORDING_STORAGE_STATUS_FAILURE,
  GetRecordingStorageStatusFailureAction,
  ENABLE_DEBUG,
  EnableDebugAction,
  DISABLE_DEBUG,
  DisableDebugAction,
  TOGGLE_DEBUG,
  ToggleDebugAction,
  LoadAccountInfoRequestActino,
  LoadAccountInfoSuccessAction,
  LOAD_ACCOUNT_INFO_SUCCESS,
  LOAD_ACCOUNT_INFO_REQUEST,
  LoadAccountInfoFailureAction,
  LOAD_ACCOUNT_INFO_FAILURE,
  SetAccountInfoRequstAction,
  SET_ACCOUNT_INFO_REQUEST,
  SetAccountInfoSuccessAction,
  SET_ACCOUNT_INFO_SUCCESS,
  SetAccountInfoFailureAction,
  SET_ACCOUNT_INFO_FAILURE,
  GET_COMPANIONS_SUCCESS,
  GetCompanionsRequestAction,
  GET_COMPANIONS_REQUEST,
  GetCompanionsFailureAction,
  GET_COMPANIONS_FAILURE,
  GetCompanionsSuccessAction,
} from './types';
import {
  Recording,
  RecordingStorageStatus,
} from '../common/Recording.interface';
import { RecordingSettings } from '../common/RecordingSettings.interface';
import { AccountInfo } from '../common/AccountInfo.interface';
import { Companion } from '../common/Companion.interface';

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

/**
 * Player actions
 */
export function playRecording(): PlayRecordingAction {
  return {
    type: PLAY_RECORDING,
  };
}

export function pauseRecording(): PauseRecordingAction {
  return {
    type: PAUSE_RECORDING,
  };
}

export function setCurrentTime(time: number): SetCurrentTimeAction {
  return {
    type: SET_CURRENT_TIME,
    payload: time,
  };
}

export function setSeekedTime(time: number) {
  return {
    type: SET_SEEKED_TIME,
    payload: time,
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

export function initDatabaseRequest(): InitDatabaseRequestAction {
  return {
    type: INIT_DATABASE_REQUEST,
  };
}

export function initDatabaseSuccess(): InitDatabaseSuccessAction {
  return {
    type: INIT_DATABASE_SUCCESS,
  };
}

export function initDatabaseFailure(error: Error): InitDatabaseFailureAction {
  return {
    type: INIT_DATABASE_FAILURE,
    payload: error,
  };
}

export function selectRecording(recording: Recording): SelectRecordingAction {
  return {
    type: SELECT_RECORDING,
    payload: recording,
  };
}

export function uploadRecordingsRequest(): UploadRecordingsRequestAction {
  return {
    type: UPLOAD_RECORDINGS_REQUEST,
  };
}

export function uploadRecordingsSuccess(
  recordings: Recording[]
): UploadRecordingsSuccessAction {
  return {
    type: UPLOAD_RECORDINGS_SUCCESS,
    payload: recordings,
  };
}

export function uploadRecordingsFailure(
  error: Error
): UploadRecordingsFailureAction {
  return {
    type: UPLOAD_RECORDINGS_FAILURE,
    payload: error,
  };
}

export function confirmError(): ConfirmErrorAction {
  return {
    type: CONFIRM_ERROR,
  };
}

export function setInputDeviceRequest(): SetInputDeviceRequestAction {
  return {
    type: SET_INPUT_DEVICE_REQUEST,
  };
}

export function setInputDeviceSuccess(): SetInputDeviceSuccessAction {
  return {
    type: SET_INPUT_DEVICE_SUCCESS,
  };
}

export function setInputDeviceFailure(
  error: Error
): SetInputDeviceFailureAction {
  return {
    type: SET_INPUT_DEVICE_FAILURE,
    payload: error,
  };
}

export function downloadRecordingRequest(): DownloadRecordingRequestAction {
  return {
    type: DOWNLOAD_RECORDING_REQUEST,
  };
}

export function downloadRecordingSucess(): DownloadRecordingSuccessAction {
  return {
    type: DOWNLOAD_RECORDING_SUCCESS,
  };
}

export function downloadRecordingFailue(
  error: Error
): DownloadRecordingFailreAction {
  return {
    type: DOWNLOAD_RECORDING_FAILURE,
    payload: error,
  };
}

export function cacheRecordingRequest(
  recording: Recording
): CachRecordingRequestAction {
  return {
    type: CACHE_RECORDING_REQUEST,
    payload: recording,
  };
}

export function cacheRecordingSuccess(): CacheRecordingSuccessAction {
  return {
    type: CACHE_RECORDING_SUCCESS,
  };
}

export function cacheRecordingFailure(
  error: Error
): CacheRecordingFailureAction {
  return {
    type: CACHE_RECORDING_FAILURE,
    payload: error,
  };
}

export function getRecordingStorageStatusRequest(): GetRecordingStorageStatusRequestAction {
  return {
    type: GET_RECORDING_STORAGE_STATUS_REQUEST,
  };
}

export function getRecordingStorageStatusSuccess(
  recordingStorageStatus: RecordingStorageStatus
): GetRecordingStorageStatusSuccessAction {
  return {
    type: GET_RECORDING_STORAGE_STATUS_SUCCESS,
    payload: recordingStorageStatus,
  };
}

export function getRecordingStorageStatusFailure(
  error: Error
): GetRecordingStorageStatusFailureAction {
  return {
    type: GET_RECORDING_STORAGE_STATUS_FAILURE,
    payload: error,
  };
}

export function enableDebug() {
  return {
    type: ENABLE_DEBUG,
  };
}

export function disableDebut() {
  return {
    type: DISABLE_DEBUG,
  };
}

export function toggleDebug(currentDebugState: boolean): ToggleDebugAction {
  return {
    type: TOGGLE_DEBUG,
    payload: currentDebugState,
  };
}

export function loadAccountInfoRequest(): LoadAccountInfoRequestActino {
  return {
    type: LOAD_ACCOUNT_INFO_REQUEST,
  };
}

export function loadAccountInfoSuccess(
  accountInfo: AccountInfo
): LoadAccountInfoSuccessAction {
  return {
    type: LOAD_ACCOUNT_INFO_SUCCESS,
    payload: accountInfo,
  };
}

export function loadAccountInfoFailure(
  error: Error
): LoadAccountInfoFailureAction {
  return {
    type: LOAD_ACCOUNT_INFO_FAILURE,
    payload: error,
  };
}

export function setAccountInfoRequest(): SetAccountInfoRequstAction {
  return {
    type: SET_ACCOUNT_INFO_REQUEST,
  };
}

export function setAccountInfoSuccess(
  accountInfoUpdate: AccountInfo
): SetAccountInfoSuccessAction {
  return {
    type: SET_ACCOUNT_INFO_SUCCESS,
    payload: accountInfoUpdate,
  };
}

export function setAccountInfoFailure(
  error: Error
): SetAccountInfoFailureAction {
  return {
    type: SET_ACCOUNT_INFO_FAILURE,
    payload: error,
  };
}

export function getCompanionsRequest(): GetCompanionsRequestAction {
  return {
    type: GET_COMPANIONS_REQUEST,
  };
}

export function getCompanionsSuccess(
  companions: Companion[]
): GetCompanionsSuccessAction {
  return {
    type: GET_COMPANIONS_SUCCESS,
    payload: companions,
  };
}

export function getCompanionsFailuere(
  error: Error
): GetCompanionsFailureAction {
  return {
    type: GET_COMPANIONS_FAILURE,
    payload: error,
  };
}
