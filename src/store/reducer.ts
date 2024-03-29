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
  SET_CURRENT_TIME,
  SET_SEEKED_TIME,
  GET_RECORDING_STORAGE_STATUS_REQUEST,
  GET_RECORDING_STORAGE_STATUS_SUCCESS,
  GET_RECORDING_STORAGE_STATUS_FAILURE,
  TOGGLE_DEBUG,
} from './types';
import { RecordingFormats } from '@/common/RecordingFormats.enum';

export const initialState: RecorderState = {
  audioSrc: null,
  caching: false,
  currentPlaying: null,
  currentTime: 0,
  databaseInitializing: true,
  debugEnabled: process.env.NODE_ENV === 'development',
  error: null,
  isRecording: false,
  isMonitoring: false,
  loading: false,
  loadingMessage: null,
  playing: false,
  recordings: [],
  recordingQueue: [], // <- Unused?
  recordingSettings: {
    channels: 2,
    format: RecordingFormats.Wav,
    selectedMediaDeviceId: 'default', // <- TODO: BUG: 'default' is an out-of-range option
  },
  seekedTime: 0,
  selectedRecording: null,
  selectedRecordingStorageStatus: null,
};

export const reducer = (
  state: RecorderState = initialState,
  action: RecorderAction
): RecorderState => {
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
        recordingQueue: [...state.recordingQueue, action.payload.filename],
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
        loading: false,
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

    /**
     * Player state
     */
    case PLAY_RECORDING:
      return {
        ...state,
        playing: true,
      };

    case PAUSE_RECORDING:
      return {
        ...state,
        playing: false,
      };

    case SET_CURRENT_TIME:
      return {
        ...state,
        currentTime: action.payload,
      };

    case SET_SEEKED_TIME:
      return {
        ...state,
        seekedTime: action.payload,
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
        databaseInitializing: true,
      };

    case INIT_DATABASE_SUCCESS:
      return {
        ...state,
        loading: false,
        databaseInitializing: false,
      };

    case INIT_DATABASE_FAILURE:
      return {
        ...state,
        loading: false,
        databaseInitializing: false,
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
        currentPlaying: action.payload,
      };

    case CACHE_RECORDING_SUCCESS:
      return {
        ...state,
        caching: false,
        playing: true,
      };

    case CACHE_RECORDING_FAILURE:
      return {
        ...state,
        caching: false,
        error: action.payload,
      };

    case GET_RECORDING_STORAGE_STATUS_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case GET_RECORDING_STORAGE_STATUS_SUCCESS:
      return {
        ...state,
        loading: false,
        selectedRecordingStorageStatus: action.payload,
      };

    case GET_RECORDING_STORAGE_STATUS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case TOGGLE_DEBUG:
      return {
        ...state,
        debugEnabled: !action.payload,
      };

    default:
      return state;
  }
};
