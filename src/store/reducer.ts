import {
  RecorderState,
  RecorderAction,
  START_RECORDING_REQUEST,
  START_RECORDING_SUCCESS,
  START_RECORDING_FAILURE,
  STOP_RECORDING_REQUEST,
  STOP_RECORDING_SUCCESS,
  STOP_RECORDING_FAILURE,
  START_MONITOR,
  STOP_MONITOR,
  LOAD_RECORDINGS_REQUEST,
  LOAD_RECORDINGS_SUCCESS,
  LOAD_RECORDINGS_FAILURE,
  DELETE_RECORDING_REQUEST,
  DELETE_RECORDING_SUCCESS,
  DELETE_RECORDING_FAILURE,
} from './types';

export const initialState: RecorderState = {
  isRecording: false,
  isMonitoring: false,
  time: 0,
  loading: false,
  error: null,
  recordings: [],
};

export const reducer = (
  state: RecorderState = initialState,
  action: RecorderAction
) => {
  switch (action.type) {
    case START_MONITOR: {
      return {
        ...state,
        isMonitoring: true,
      };
    }

    case STOP_MONITOR: {
      return {
        ...state,
        isMonitoring: false,
      };
    }

    case START_RECORDING_REQUEST:
      return {
        ...state,
        isRecording: true,
        // loading: true,
      };

    case START_RECORDING_SUCCESS:
      return {
        ...state,
        loading: false,
        isRecording: true,
      };

    case START_RECORDING_FAILURE:
      return {
        ...state,
        loading: false,
        isRecording: false,
        error: action.payload,
      };

    case STOP_RECORDING_REQUEST:
      return {
        ...state,
        isRecording: false,
        // loading: true,
      };

    case STOP_RECORDING_SUCCESS:
      return {
        ...state,
        loading: false,
        isRecording: false,
      };

    case STOP_RECORDING_FAILURE:
      return {
        ...state,
        loaing: false,
        isRecording: false,
        error: action.payload,
      };

    case LOAD_RECORDINGS_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case LOAD_RECORDINGS_SUCCESS:
      return {
        ...state,
        loading: false,
        recordings: action.payload,
      };

    case LOAD_RECORDINGS_FAILURE:
      return {
        ...state,
        loading: true,
        error: action.payload,
      };

    case DELETE_RECORDING_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case DELETE_RECORDING_SUCCESS:
      return {
        ...state,
        loading: false,
        recordings: state.recordings.filter(
          (recording) => recording.id !== action.payload
        ),
      };

    default:
      return state;
  }
};
