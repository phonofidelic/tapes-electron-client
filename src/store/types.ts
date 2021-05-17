import { Action } from 'redux';
import { Recording } from '../common/Recording.interface';
import { RecordingSettings } from '../common/RecordingSettings.interface';

export const START_RECORDING_REQUEST = 'start_recording_request',
  START_RECORDING_SUCCESS = 'start_recording_success',
  START_RECORDING_FAILURE = 'start_recording_failure',
  STOP_RECORDING_REQUEST = 'stop_recording_request',
  STOP_RECORDING_SUCCESS = 'stop_recording_success',
  STOP_RECORDING_FAILURE = 'stop_recording_failure',
  START_MONITOR = 'start_monitor',
  STOP_MONITOR = 'stop_monitor',
  ADD_RECORDING_REQUEST = 'add_recording_request',
  ADD_RECORDING_SUCCESS = 'add_recording_success',
  ADD_RECORDING_FAILURE = 'add_recording_failure',
  EDIT_RECORDING_REQUEST = 'edit_recording_request',
  EDIT_RECORDING_SUCCESS = 'edit_recording_success',
  EDIT_RECORDING_FAILURE = 'edit_recording_failure',
  LOAD_RECORDINGS_REQUEST = 'load_recordings_request',
  LOAD_RECORDINGS_SUCCESS = 'load_recordings_success',
  LOAD_RECORDINGS_FAILURE = 'load_recordings_failure',
  DELETE_RECORDING_REQUEST = 'delete_recording_request',
  DELETE_RECORDING_SUCCESS = 'delete_recording_success',
  DELETE_RECORDING_FAILURE = 'delete_recording_failure',
  PLAY_RECORDING = 'play_recording',
  PAUSE_RECORDING = 'pause_recording',
  GET_BUCKET_TOKEN_REQUEST = 'get_bucket_token_request',
  GET_BUCKET_TOKEN_SUCCESS = 'get_bucket_token_success',
  GET_BUCKET_TOKEN_FAILURE = 'get_bucket_token_failure',
  LOAD_ACCOUNT_TOKEN_REQUEST = 'load_account_token_request',
  LOAD_ACCOUNT_TOKEN_SUCCESS = 'load_account_token_success',
  LOAD_ACCOUNT_TOKEN_FAILURE = 'load_account_token_failure',
  SET_RECORDING_SETTINGS = 'set_recording_settings',
  SET_LOADING_MESSAGE = 'set_loading_message',
  INIT_DATABASE_REQUEST = 'init_database_request',
  INIT_DATABASE_SUCCESS = 'init_database_success',
  INIT_DATABASE_FAILURE = 'init_database_failure';

export interface RecorderState {
  isRecording: boolean;
  isMonitoring: boolean;
  time: number;
  loading: boolean | { message: string };
  loadingMessage: string | null;
  error: Error | null;
  recordings: Recording[];
  playing: string;
  bucketToken: string | null;
  recordingSettings: RecordingSettings;
  recordingQueue: string[];
  accountToken: string | null;
}

export interface StartRecordingRequestAction extends Action {
  type: typeof START_RECORDING_REQUEST;
}

export interface StartRecordingSuccessAction extends Action {
  type: typeof START_RECORDING_SUCCESS;
  payload: Recording;
}

export interface StartRecordingFailureAction extends Action {
  type: typeof START_RECORDING_FAILURE;
  payload: Error;
}

export interface StopRecordingRequestAction extends Action {
  type: typeof STOP_RECORDING_REQUEST;
}

export interface StopRecordingSuccessAction extends Action {
  type: typeof STOP_RECORDING_SUCCESS;
}

export interface StopRecordingFailureAction extends Action {
  type: typeof STOP_RECORDING_FAILURE;
  payload: Error;
}

export interface StartMonitorAction extends Action {
  type: typeof START_MONITOR;
}

export interface StopMonitorAction extends Action {
  type: typeof STOP_MONITOR;
}

// NOT IN USE?
export interface AddRecordingRequestAction extends Action {
  type: typeof ADD_RECORDING_REQUEST;
}

export interface AddRecordingSuccessAction extends Action {
  type: typeof ADD_RECORDING_SUCCESS;
  // TODO: add Recording or recording ID payload?
  payload: Recording;
}

export interface AddRecordingFailureAction extends Action {
  type: typeof ADD_RECORDING_FAILURE;
  payload: Error;
}

export interface EditRecordingRequestAction extends Action {
  type: typeof EDIT_RECORDING_REQUEST;
  // TODO: Fix any type
}

export interface EditRecordingSuccessAction extends Action {
  type: typeof EDIT_RECORDING_SUCCESS;
  payload: Recording;
}

export interface EditRecordingFailureAction extends Action {
  type: typeof EDIT_RECORDING_FAILURE;
  payload: Error;
}

export interface LoadRecordingsRequestAction extends Action {
  type: typeof LOAD_RECORDINGS_REQUEST;
}

export interface LoadRecordingsSuccessAction extends Action {
  type: typeof LOAD_RECORDINGS_SUCCESS;
  payload: Recording[];
}

export interface LoadRecordingsFailureAction extends Action {
  type: typeof LOAD_RECORDINGS_FAILURE;
  payload: Error;
}

export interface DeleteRecordingRequestAction extends Action {
  type: typeof DELETE_RECORDING_REQUEST;
  payload: string;
}

export interface DeleteRecordingSuccessAction extends Action {
  type: typeof DELETE_RECORDING_SUCCESS;
  payload: string;
}

export interface DeleteRecordingFailureAction extends Action {
  type: typeof DELETE_RECORDING_FAILURE;
  payload: Error;
}

export interface PlayRecordingAction extends Action {
  type: typeof PLAY_RECORDING;
  payload: string;
}

export interface PauseRecordingAction extends Action {
  type: typeof PAUSE_RECORDING;
}

export interface GetBucketTokenRequestAction extends Action {
  type: typeof GET_BUCKET_TOKEN_REQUEST;
}

export interface GetBucketTokenSuccessAction extends Action {
  type: typeof GET_BUCKET_TOKEN_SUCCESS;
  payload: string;
}

export interface GetBucketTokenFailureAction extends Action {
  type: typeof GET_BUCKET_TOKEN_FAILURE;
  payload: Error;
}

export interface LoadAccountTokenRequestAction extends Action {
  type: typeof LOAD_ACCOUNT_TOKEN_REQUEST;
}

export interface LoadAccountTokenSuccessAction extends Action {
  type: typeof LOAD_ACCOUNT_TOKEN_SUCCESS;
  payload: string;
}

export interface LoadAccountTokenFailureAction extends Action {
  type: typeof LOAD_ACCOUNT_TOKEN_FAILURE;
  payload: Error;
}

export interface SetRecordingSettingsAction extends Action {
  type: typeof SET_RECORDING_SETTINGS;
  payload: RecordingSettings;
}

export interface SettLoadingMessageAction extends Action {
  type: typeof SET_LOADING_MESSAGE;
  payload: string;
}

export interface InitDatabaseRequestAction extends Action {
  type: typeof INIT_DATABASE_REQUEST;
}

export interface InitDatabaseSuccessAction extends Action {
  type: typeof INIT_DATABASE_SUCCESS;
}

export interface InitDatabaseFailureAction extends Action {
  type: typeof INIT_DATABASE_FAILURE;
  payload: Error;
}

export type RecorderAction =
  | StartRecordingRequestAction
  | StartRecordingSuccessAction
  | StartRecordingFailureAction
  | StopRecordingRequestAction
  | StopRecordingSuccessAction
  | StopRecordingFailureAction
  | StartMonitorAction
  | StopMonitorAction
  | AddRecordingRequestAction
  | AddRecordingSuccessAction
  | AddRecordingFailureAction
  | EditRecordingRequestAction
  | EditRecordingSuccessAction
  | EditRecordingFailureAction
  | LoadRecordingsRequestAction
  | LoadRecordingsSuccessAction
  | LoadRecordingsFailureAction
  | DeleteRecordingRequestAction
  | DeleteRecordingSuccessAction
  | DeleteRecordingFailureAction
  | PlayRecordingAction
  | PauseRecordingAction
  | GetBucketTokenRequestAction
  | GetBucketTokenSuccessAction
  | GetBucketTokenFailureAction
  | LoadAccountTokenRequestAction
  | LoadAccountTokenSuccessAction
  | LoadAccountTokenFailureAction
  | SetRecordingSettingsAction
  | SettLoadingMessageAction
  | InitDatabaseRequestAction
  | InitDatabaseSuccessAction
  | InitDatabaseFailureAction;
