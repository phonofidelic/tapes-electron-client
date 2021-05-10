import {
  RecorderState,
  RecorderAction,
  START_RECORDING_REQUEST,
  START_RECORDING_SUCCESS,
  START_RECORDING_FAILURE,
  STOP_RECORDING_REQUEST,
  STOP_RECORDING_SUCCESS,
  STOP_RECORDING_FAILURE,
  ADD_RECORDING_REQUEST,
  ADD_RECORDING_SUCCESS,
  ADD_RECORDING_FAILURE,
  EDIT_RECORDING_REQUEST,
  EDIT_RECORDING_SUCCESS,
  EDIT_RECORDING_FAILURE,
  START_MONITOR,
  STOP_MONITOR,
  LOAD_RECORDINGS_REQUEST,
  LOAD_RECORDINGS_SUCCESS,
  LOAD_RECORDINGS_FAILURE,
  DELETE_RECORDING_REQUEST,
  DELETE_RECORDING_SUCCESS,
  DELETE_RECORDING_FAILURE,
  PLAY_RECORDING,
  PAUSE_RECORDING,
  GET_BUCKET_DATA_REQUEST,
  GET_BUCKET_DATA_SUCCESS,
  GET_BUCKET_DATA_FAILURE,
  SET_RECORDING_SETTINGS,
} from './types';
import { RecordingFormats } from '../common/RecordingFormats.enum';

export const initialState: RecorderState = {
  isRecording: false,
  isMonitoring: false,
  time: 0,
  loading: false,
  error: null,
  recordings: [],
  playing: null,
  bucketInfo: null,
  recordingSettings: {
    channels: 2,
    format: RecordingFormats.Mp3,
  },
  recordingQueue: [],
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
        // loading: false,
        // isRecording: true,
        recordingQue: [...state.recordingQueue, action.payload.filename],
      };

    case START_RECORDING_FAILURE:
      return {
        ...state,
        // loading: false,
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
        // loading: false,
        isRecording: false,
      };

    case STOP_RECORDING_FAILURE:
      return {
        ...state,
        loading: false,
        isRecording: false,
        error: action.payload,
      };

    case ADD_RECORDING_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case ADD_RECORDING_SUCCESS:
      return {
        ...state,
        loading: false,
        recordings: [...state.recordings, action.payload],
        recordingQueue: state.recordingQueue.filter(
          (filename) => action.payload.filename !== filename
        ),
      };

    case ADD_RECORDING_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case EDIT_RECORDING_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case EDIT_RECORDING_SUCCESS:
      return {
        ...state,
        loading: false,
        recordings: state.recordings.map((recording) =>
          recording._id === action.payload._id ? action.payload : recording
        ),
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
        // loading: true,
        recordings: state.recordings.filter(
          (recording) => recording._id !== action.payload
        ),
      };

    case DELETE_RECORDING_SUCCESS:
      return {
        ...state,
        // loading: false,
      };

    case DELETE_RECORDING_FAILURE:
      return {
        ...state,
        // loading: false,
        error: action.payload,
      };

    case PLAY_RECORDING:
      return {
        ...state,
        playing: action.payload,
      };

    case PAUSE_RECORDING:
      return {
        ...state,
        playing: null,
      };

    case GET_BUCKET_DATA_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case GET_BUCKET_DATA_SUCCESS:
      return {
        ...state,
        loading: false,
        bucketInfo: action.payload,
      };

    case GET_BUCKET_DATA_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case SET_RECORDING_SETTINGS:
      return {
        ...state,
        recordingSettings: action.payload,
      };

    default:
      return state;
  }
};
