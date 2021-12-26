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
  GET_BUCKET_TOKEN_REQUEST,
  GET_BUCKET_TOKEN_SUCCESS,
  GET_BUCKET_TOKEN_FAILURE,
  LOAD_ACCOUNT_TOKEN_REQUEST,
  LOAD_ACCOUNT_TOKEN_SUCCESS,
  LOAD_ACCOUNT_TOKEN_FAILURE,
  SET_RECORDING_SETTINGS,
  SET_LOADING_MESSAGE,
  INIT_DATABASE_REQUEST,
  INIT_DATABASE_SUCCESS,
  INIT_DATABASE_FAILURE,
  SELECT_RECORDING,
  UPLOAD_RECORDINGS_REQUEST,
  UPLOAD_RECORDINGS_SUCCESS,
  UPLOAD_RECORDINGS_FAILURE,
  SET_INPUT_DEVICE_REQUEST,
  SET_INPUT_DEVICE_SUCCESS,
  SET_INPUT_DEVICE_FAILURE,
  CONFIRM_ERROR,
  DOWNLOAD_RECORDING_REQUEST,
  DOWNLOAD_RECORDING_SUCCESS,
  DOWNLOAD_RECORDING_FAILURE,
  CACHE_RECORDING_REQUEST,
  CACHE_RECORDING_SUCCESS,
  CACHE_RECORDING_FAILURE,
} from './types';
import { RecordingFormats } from '../common/RecordingFormats.enum';
import { IDENTITY_STORE } from '../common/constants';

export const initialState: RecorderState = {
  isRecording: false,
  isMonitoring: false,
  time: 0,
  loading: false,
  loadingMessage: null,
  error: null,
  recordings: [],
  playing: null,
  bucketToken: null,
  recordingSettings: {
    channels: 2,
    format: RecordingFormats.Wav,
    selectedMediaDeviceId: 'default',
  },
  recordingQueue: [],
  accountToken: localStorage.getItem(IDENTITY_STORE), // <-- ANTI-PATTERN?
  selectedRecording: null,
  caching: false,
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
        selectedRecording: action.payload,
      };

    case EDIT_RECORDING_FAILURE:
      return {
        ...state,
        loading: false,
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
        recordings: state.recordings.filter(
          (recording) => recording._id !== action.payload
        ),
      };

    case DELETE_RECORDING_SUCCESS:
      return {
        ...state,
        loading: false,
      };

    case DELETE_RECORDING_FAILURE:
      return {
        ...state,
        loading: false,
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

    case GET_BUCKET_TOKEN_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case GET_BUCKET_TOKEN_SUCCESS:
      return {
        ...state,
        loading: false,
        bucketToken: action.payload,
      };

    case GET_BUCKET_TOKEN_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case LOAD_ACCOUNT_TOKEN_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case LOAD_ACCOUNT_TOKEN_SUCCESS:
      return {
        ...state,
        loading: false,
        accountToken: action.payload,
        recordings: [],
      };

    case LOAD_ACCOUNT_TOKEN_FAILURE:
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

    case SET_LOADING_MESSAGE:
      return {
        ...state,
        loadingMessage: action.payload,
      };

    case INIT_DATABASE_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case INIT_DATABASE_SUCCESS:
      return {
        ...state,
        loading: false,
      };

    case INIT_DATABASE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case SELECT_RECORDING:
      return {
        ...state,
        selectedRecording: action.payload,
      };

    case UPLOAD_RECORDINGS_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case UPLOAD_RECORDINGS_SUCCESS:
      return {
        ...state,
        loading: false,
        recordings: [...action.payload, ...state.recordings],
      };

    case UPLOAD_RECORDINGS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case SET_INPUT_DEVICE_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case SET_INPUT_DEVICE_SUCCESS:
      return {
        ...state,
        loading: false,
      };

    case SET_INPUT_DEVICE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case CONFIRM_ERROR:
      return {
        ...state,
        error: null,
      };

    case DOWNLOAD_RECORDING_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case DOWNLOAD_RECORDING_SUCCESS:
      return {
        ...state,
        loading: false,
      };

    case DOWNLOAD_RECORDING_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case CACHE_RECORDING_REQUEST:
      return {
        ...state,
        caching: true,
      };

    case CACHE_RECORDING_SUCCESS:
      return {
        ...state,
        caching: false,
      };

    case CACHE_RECORDING_FAILURE:
      return {
        ...state,
        caching: false,
        error: action.payload,
      };

    default:
      return state;
  }
};
