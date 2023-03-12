import { ThunkAction } from 'redux-thunk';
import {
  setLoadingMessage,
  initDatabaseRequest,
  initDatabaseSuccess,
  initDatabaseFailure,
  loadRecordingsRequest,
  loadRecordingsSuccess,
  loadRecordingsFailure,
  pauseRecording,
  cacheRecordingRequest,
  playRecording,
  cacheRecordingSuccess,
  editRecordingRequest,
  editRecordingSuccess,
  editRecordingFailure,
  loadAccountInfoFailure,
  loadAccountInfoRequest,
  loadAccountInfoSuccess,
  setAccountInfoRequest,
  setAccountInfoFailure,
  setAccountInfoSuccess,
  getCompanionsRequest,
  getCompanionsSuccess,
  getCompanionsFailure,
} from '../store/actions';
import { RecordingSettings } from '../common/RecordingSettings.interface';
import { Recording } from '../common/Recording.interface';
import { RecorderState, RecorderAction } from '../store/types';
import { AccountInfo } from '../common/AccountInfo.interface';
import { Companion } from '../common/Companion.interface';
import OrbitConnection from '../db/OrbitConnection';
import { RecordingRepository } from '../db/Repository';
import { RECORDING_COLLECTION } from '@/common/constants';

type Effect = ThunkAction<void, RecorderState, unknown, RecorderAction>;

export const uploadAudioFiles =
  (audioFiles: File[]): Effect =>
  async (dispatch) => {
    console.log('TODO: implement uploadAudioFiles for web');
  };

export const startRecording =
  (recordingSettings: RecordingSettings): Effect =>
  async (dispatch) => {
    console.log('TODO: implement startRecording for web');
  };

export const stopRecording = (): Effect => async (dispatch) => {
  console.log('TODO: implement stopRecording for web');
};

export const loadRecordings = (): Effect => async (dispatch) => {
  dispatch(loadRecordingsRequest());
  await OrbitConnection.Instance.connect();

  console.log(
    'loadRecordings, recordingsAddrRoot',
    OrbitConnection.Instance.recordingsAddrRoot
  );

  try {
    dispatch(setLoadingMessage('Loading library...'));
    const repository = new RecordingRepository(
      OrbitConnection.Instance,
      RECORDING_COLLECTION,
      OrbitConnection.Instance.recordingsAddrRoot
    );

    const recordings = await repository.find({});

    dispatch(loadRecordingsSuccess(recordings));
    dispatch(setLoadingMessage(null));
  } catch (err) {
    if (err.message === 'Async call timeout limit reached') {
      console.log('Timeout limit reached. Clearing companion list...');
      await OrbitConnection.Instance.removeAllCompanions();
      loadRecordings();
    } else {
      console.error(err);
      dispatch(loadRecordingsFailure(err));
    }
  }
};

export const editRecording =
  (recordingId: string, update: any): Effect =>
  async (dispatch) => {
    dispatch(editRecordingRequest());
    try {
      await OrbitConnection.Instance.connect();
      const repository = new RecordingRepository(
        OrbitConnection.Instance,
        RECORDING_COLLECTION,
        OrbitConnection.Instance.recordingsAddrRoot
      );
      const updatedRecording = await repository.update(recordingId, update);

      console.log('updatedRecording:', updatedRecording);
      dispatch(editRecordingSuccess(updatedRecording));
    } catch (err) {
      console.error('Could not update Recording document:', err);
      dispatch(editRecordingFailure(err));
    }
  };

export const deleteRecording =
  (recordingId: string): Effect =>
  async (dispatch) => {
    console.log('TODO: implement deleteRecording for web');
  };

export const loadAccountToken =
  (tokenString: string): Effect =>
  async (dispatch) => {
    console.log('TODO: implement loadAccountToken for web');
  };

export const initDatabase =
  (desktopPeerId: string, recordingsAddrRoot: string): Effect =>
  async (dispatch) => {
    dispatch(initDatabaseRequest());
    dispatch(setLoadingMessage('Initializing database...'));

    try {
      await OrbitConnection.Instance.connect(desktopPeerId, recordingsAddrRoot);

      console.log('Database initialized');
      dispatch(initDatabaseSuccess());
    } catch (err) {
      console.error('Could not initialize database:', err);
      dispatch(initDatabaseFailure(err));
    }
  };

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
