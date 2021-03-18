import { Action } from 'redux';
import { Recording } from '../common/Recording.interface';

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
  LOAD_RECORDINGS_REQUEST = 'load_recordings_request',
  LOAD_RECORDINGS_SUCCESS = 'load_recordings_success',
  LOAD_RECORDINGS_FAILURE = 'load_recordings_failure',
  DELETE_RECORDING_REQUEST = 'delete_recording_request',
  DELETE_RECORDING_SUCCESS = 'delete_recording_success',
  DELETE_RECORDING_FAILURE = 'delete_recording_failure',
  PLAY_RECORDING = 'play_recording',
  PAUSE_RECORDING = 'pause_recording';

export interface RecorderState {
  isRecording: boolean;
  isMonitoring: boolean;
  time: number;
  loading: boolean;
  error: Error | null;
  recordings: Recording[];
  playing: string;
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

export interface AddNewRecAction extends Action {
  type: typeof ADD_RECORDING_REQUEST;
}

export interface LoadRecordingsRequestAction extends Action {
  type: typeof LOAD_RECORDINGS_REQUEST;
}

export interface LoadRecordingsuccessAction extends Action {
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

export type RecorderAction =
  | StartRecordingRequestAction
  | StartRecordingSuccessAction
  | StartRecordingFailureAction
  | StopRecordingRequestAction
  | StopRecordingSuccessAction
  | StopRecordingFailureAction
  | StartMonitorAction
  | StopMonitorAction
  | AddNewRecAction
  | LoadRecordingsRequestAction
  | LoadRecordingsuccessAction
  | LoadRecordingsFailureAction
  | DeleteRecordingRequestAction
  | DeleteRecordingSuccessAction
  | DeleteRecordingFailureAction
  | PlayRecordingAction
  | PauseRecordingAction;