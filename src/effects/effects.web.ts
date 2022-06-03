import { ThunkAction } from 'redux-thunk';
import {
  setLoadingMessage,
  initDatabaseRequest,
  initDatabaseSuccess,
  initDatabaseFailure,
  loadRecordingsRequest,
  loadRecordingsSuccess,
  loadRecordingsFailure
} from '../store/actions';
import { RecordingSettings } from '../common/RecordingSettings.interface';
import { Recording } from '../common/Recording.interface';
import { RecorderState, RecorderAction } from '../store/types';
import { OrbitDatabase } from '../db/db-orbit'

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
    // const recordings = await window.db.find('recordings', {})
    const recordings = await window.db.queryNetwork('recordings', (doc: any) => doc)

    dispatch(loadRecordingsSuccess(recordings));
    dispatch(setLoadingMessage(null));
  } catch (err) {
    console.error(err);
    dispatch(loadRecordingsFailure(err));
  }
}

export const editRecording = (recordingId: string, update: any): Effect => async (dispatch) => {
  console.log('TODO: implement editRecording for web')
}

export const deleteRecording = (recordingId: string): Effect => async (dispatch) => {
  console.log('TODO: implement deleteRecording for web')
}

export const loadAccountToken = (tokenString: string): Effect => async (dispatch) => {
  console.log('TODO: implement loadAccountToken for web')
}

export const initDatabase = (desktopPeerId: string): Effect => async (dispatch) => {
  dispatch(initDatabaseRequest());
  dispatch(setLoadingMessage('Initializing database...'));

  try {
    window.db = new OrbitDatabase({})
    await window.db.init(desktopPeerId)
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
  console.log('TODO: implement cacheAndPlayRecording for web')
}

export const getRecordingStorageStatus = (recordingCid: string): Effect => async (dispatch) => {
  console.log('TODO: implement getRecordingStorageStatus for web')
}

export const exportIdentity = (): Effect => async (dispatch) => {
  console.log('TODO: implement exportIdentity for web')
}

const replicateDb = async (peerDb: any) => {
  console.log('*** handlePeerDbDiscovered, peerDb:', peerDb)
  const docStores = peerDb.get('docStores')
  console.log('*** docStores:', docStores)

  const dbAddrs: { path: string, root: string }[] = Object.values(docStores)
  console.log('*** dbAddrs:', dbAddrs)

  const allRecordings = await Promise.all(dbAddrs.map(async (addr) => {
    const db = await window.db.orbitdb.open(`${addr.root}/${addr.path}`)
    await db.load()
    return await db.get('')
  }))
  console.log('*** allRecordings:', allRecordings[0])
  // setRecordings(allRecordings[0])

  // for await(const record of allRecordings[0]) {
  //   try {
  //     await window.db.add('recordings', record)
  //   } catch (err) {
  //     console.error('Could not replicate record:', record)
  //   }
  // }
}