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
  getCompanionsFailuere
} from '../store/actions';
import { RecordingSettings } from '../common/RecordingSettings.interface';
import { Recording } from '../common/Recording.interface';
import { RecorderState, RecorderAction } from '../store/types';
import { OrbitDatabase } from '../db/db-orbit'
import { asyncCallWithTimeout } from '../utils';
import { AccountInfo } from '../common/AccountInfo.interface';
import { Companion } from '../common/Companion.interface';

type Effect = ThunkAction<void, RecorderState, unknown, RecorderAction>;

export const uploadAudioFiles = (audioFiles: File[]): Effect => async (dispatch) => {
  console.log('TODO: implement uploadAudioFiles for web')
}

export const startRecording = (recordingSettings: RecordingSettings): Effect => async (dispatch) => {
  console.log('TODO: implement startRecording for web')
}

export const stopRecording = (): Effect => async (dispatch) => {
  console.log('TODO: implement stopRecording for web')
}

export const loadRecordings = (): Effect => async (dispatch) => {
  dispatch(loadRecordingsRequest());

  try {
    dispatch(setLoadingMessage('Loading library...'));
    const recordings = await window.db.find('recordings', {})
    // const recordings = await asyncCallWithTimeout(window.db.queryNetwork('recordings', (doc: any) => doc), 15000) as Recording[]

    dispatch(loadRecordingsSuccess(await recordings));
    dispatch(setLoadingMessage(null));
  } catch (err) {
    if (err.message === 'Async call timeout limit reached') {
      console.log('Timeout limit reached. Clearing companion list...')
      await window.db.removeAllCompanions()
      loadRecordings()
    } else {
      console.error(err);
      dispatch(loadRecordingsFailure(err));
    }
  }
}

export const editRecording = (recordingId: string, update: any): Effect => async (dispatch) => {
  dispatch(editRecordingRequest());
  try {
    const updatedRecording = await window.db.update('recordings', recordingId, update)
    console.log('updatedRecording:', updatedRecording);
    dispatch(editRecordingSuccess(updatedRecording));
  } catch (err) {
    console.error('Could not update Recording document:', err);
    dispatch(editRecordingFailure(err));
  }
}

export const deleteRecording = (recordingId: string): Effect => async (dispatch) => {
  console.log('TODO: implement deleteRecording for web')
}

export const loadAccountToken = (tokenString: string): Effect => async (dispatch) => {
  console.log('TODO: implement loadAccountToken for web')
}

export const initDatabase = (desktopPeerId: string, recordingsAddrRoot: string): Effect => async (dispatch) => {
  dispatch(initDatabaseRequest());
  dispatch(setLoadingMessage('Initializing database...'));

  try {
    window.db = new OrbitDatabase({})
    await window.db.init(desktopPeerId, recordingsAddrRoot)
    console.log('Database initialized');

    // await window.db.removeAllCompanions()

    dispatch(initDatabaseSuccess());
  } catch (err) {
    console.error('Could not initialize database:', err)
    dispatch(initDatabaseFailure(err));
  }
}

export const setInputDevice = (deviceName: string): Effect => async (dispatch) => {
  console.log('TODO: implement setInputDevice for web')
}

export const downloadRecording = (recordingId: string): Effect => async (dispatch) => {
  console.log('TODO: implement downloadRecording for web')
}

export const cacheAndPlayRecording = (recording: Recording): Effect => async (dispatch) => {
  dispatch(pauseRecording())
  dispatch(cacheRecordingRequest(recording))
  dispatch(cacheRecordingSuccess())
  dispatch(playRecording())
}

export const getRecordingStorageStatus = (recordingCid: string): Effect => async (dispatch) => {
  console.log('TODO: implement getRecordingStorageStatus for web')
}

export const exportIdentity = (): Effect => async (dispatch) => {
  console.log('TODO: implement exportIdentity for web')
}

export const loadAccountInfo = (): Effect => (dispatch) => {
  dispatch(loadAccountInfoRequest())

  try {
    const accountInfo = window.db.getAccountInfo()
    console.log('loadAccountInfo, accountInfo:', accountInfo)
    
    dispatch(loadAccountInfoSuccess(accountInfo))
  } catch (err) {
    console.error('Could not load account info:', err)
    dispatch(loadAccountInfoFailure(new Error('Could not load account info')))
  }
}

export const setAccountInfo = (key: keyof AccountInfo, value: string): Effect => async (dispatch) => {
  dispatch(setAccountInfoRequest())

  try {
    await window.db.setAccountInfo(key, value)
    const updatedAccountInfo = window.db.getAccountInfo()
    dispatch(setAccountInfoSuccess(updatedAccountInfo))
  } catch (err) {
    console.log('Could not set account info:', err)
    dispatch(setAccountInfoFailure(new Error('Could not set account info')))
  }
}

export const getCompanions = (): Effect => (dispatch) => {
  dispatch(getCompanionsRequest)
  
  try {
  const companions = window.db.getAllCompanions()

  const companionsArray: Companion[] = Object.keys(companions).map((key: string) => ({
    dbAddress: companions[key].dbAddress,
    deviceName: companions[key].deviceName,
    docStores: companions[key].docStores,
    nodeId: companions[key].nodeId,
    status: companions[key].status
  }))

  dispatch(getCompanionsSuccess(companionsArray))
  } catch (err) {
    console.error('Could not retrieve companions:', err)
    dispatch(getCompanionsFailuere(new Error('Could not retrieve companions')))
  }
}