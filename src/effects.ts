import { ThunkAction } from 'redux-thunk';
import { RecorderState, RecorderAction } from './store/types';
import {
  startRecordingRequest,
  startRecordingSuccess,
  startRecordingFailure,
  loadRecordingsRequest,
  loadRecordingsSuccess,
  loadRecordingsFailure,
  deleteRecordingRequest,
  deleteRecordingSuccess,
  deleteRecordingFailure,
  stopRecordingRequest,
  stopRecordingFailure,
  stopRecordingSuccess,
  addRecordingRequest,
  addRecordingSuccess,
  addRecordingFailure,
  editRecordingRequest,
  editRecordingSuccess,
  editRecordingFailure,
  getBucketTokenRequest,
  getBucketTokenSuccess,
  getBucketTokenFailure,
  loadAccountTokenRequest,
  loadAccountTokenSuccess,
  loadAccountTokenFailure,
  setLoadingMessage,
  initDatabaseRequest,
  initDatabaseSuccess,
  initDatabaseFailure,
} from './store/actions';
import { db, RecordingModel } from './db';
import { Recording } from './common/Recording.interface';
import { RecordingSettings } from './common/RecordingSettings.interface';
import { RECORDING_COLLECTION, IDENTITY_STORE } from './common/constants';
import { IpcService } from './IpcService';
import { Buckets, KeyInfo, PrivateKey } from '@textile/hub';

// const THREADS_DB_NAME = 'tapes-thread-db';
// const RECORDING_COLLECTION = 'Recording';

declare const USER_API_KEY: any;

const ipc = new IpcService();

/**
 * Textile utils
 *
 * getBucket:
 * https://github.com/textileio/js-examples/blob/a8a5a9fe8cf8331f0bc4f811791e15dbc0597469/bucket-photo-gallery/src/App.tsx#L99
 */
const IPFS_GATEWAY = 'https://hub.textile.io';
const keyInfo: KeyInfo = {
  key: USER_API_KEY,
};

const getBucket = async () => {
  const storedIdent = localStorage.getItem(IDENTITY_STORE);
  const identity = PrivateKey.fromString(storedIdent);

  if (!identity) {
    throw new Error('Identity not set');
  }
  const buckets = await Buckets.withKeyInfo(keyInfo, { debug: true });
  // Authorize the user and your insecure keys with getToken
  const token = await buckets.getToken(identity);

  const buck = await buckets.getOrCreate('com.phonofidelic.tapes', {
    encrypted: true,
  });
  if (!buck.root) {
    throw new Error('Failed to open bucket');
  }

  return {
    token,
    buckets: buckets,
    bucketKey: buck.root.key,
    threadId: buck.threadID,
  };
};
/** End Textile utils */

type Effect = ThunkAction<void, RecorderState, unknown, RecorderAction>;

export const startRecording =
  (recordingSettings: RecordingSettings): Effect =>
  async (dispatch) => {
    dispatch(startRecordingRequest());

    let ipcResponse: { data: Recording; file?: any; error?: Error };
    let recordingData;
    try {
      ipcResponse = await ipc.send('recorder:start', {
        data: recordingSettings,
      });
      console.log('recorder:start, ipcResponse:', ipcResponse);

      recordingData = ipcResponse.data;
      console.log('recordingData:', recordingData);
      // dispatch(startRecordingSuccess(recordingData));
    } catch (err) {
      dispatch(startRecordingFailure(err));
    }

    try {
      dispatch(addRecordingRequest());

      const recordingCount = (await db.find(RECORDING_COLLECTION, {})).length;
      console.log('recordingCount:', recordingCount);

      const title = `Recording #${recordingCount + 1}`;

      /**
       * Push audio data to IPFS
       */
      const { buckets, bucketKey, threadId } = await getBucket();

      const pushPathResult = await buckets.pushPath(
        bucketKey,
        recordingData.filename,
        await ipcResponse.file
      );
      console.log('pushPathResult:', pushPathResult);

      /**
       * Set remote Textile Bucket location
       */
      const remoteLocation =
        IPFS_GATEWAY +
        '/thread/' +
        threadId +
        '/buckets/' +
        bucketKey +
        '/' +
        recordingData.filename;

      const recordingDoc = new RecordingModel(
        recordingData.location,
        recordingData.filename,
        title,
        recordingData.size,
        recordingData.format,
        recordingData.channels,
        recordingData.duration,
        remoteLocation
      );

      /**
       * Add recording doc to Textile DB
       */
      const newRecordingId = await db.add(RECORDING_COLLECTION, recordingDoc);
      console.log('recordingDoc:', recordingDoc);

      /**
       * Update recording doc with remoteLocation
       */
      await db.update(RECORDING_COLLECTION, newRecordingId, {
        remoteLocation,
        bucketPath: pushPathResult.path.path,
      });

      const createdRecording = (await db.findById(
        RECORDING_COLLECTION,
        newRecordingId
      )) as unknown as Recording;

      dispatch(addRecordingSuccess(createdRecording));
      await db.push(RECORDING_COLLECTION);
    } catch (err) {
      console.error('startRecordingRequest error:', err);
      dispatch(addRecordingFailure(err));
    }
  };

export const stopRecording = (): Effect => async (dispatch) => {
  dispatch(stopRecordingRequest());

  try {
    ipc.send('recorder:stop');
    console.log('recorder:stop');
    // dispatch(stopRecordingSuccess());
  } catch (err) {
    dispatch(stopRecordingFailure(err));
  }
};

export const loadRecordings = (): Effect => async (dispatch) => {
  dispatch(loadRecordingsRequest());

  try {
    dispatch(setLoadingMessage('Retrieving remote data...'));
    await db.pull(RECORDING_COLLECTION);
    dispatch(setLoadingMessage('Loading library...'));
    const recordings = (await db.find(
      RECORDING_COLLECTION,
      {}
    )) as unknown as Recording[];

    dispatch(loadRecordingsSuccess(recordings));
    dispatch(setLoadingMessage(null));
  } catch (err) {
    console.error(err);
    dispatch(loadRecordingsFailure(err));
  }
};

export const editRecording =
  (recordingId: string, update: any): Effect =>
  async (dispatch) => {
    dispatch(editRecordingRequest());

    try {
      await db.update(RECORDING_COLLECTION, recordingId, update);
      await db.push(RECORDING_COLLECTION);
      const updatedRecording = (await db.findById(
        RECORDING_COLLECTION,
        recordingId
      )) as unknown as Recording;
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
    dispatch(deleteRecordingRequest(recordingId));

    let recording;
    try {
      /**
       * Get data for Recording to delete
       */
      dispatch(setLoadingMessage('Retrieving data to remove...'));
      recording = (await db.findById(
        RECORDING_COLLECTION,
        recordingId
      )) as unknown as Recording;
    } catch (err) {
      console.error('Could not find Recording to be deleted:', err);
      return dispatch(deleteRecordingFailure(err));
    }

    try {
      /**
       * Delete in Textile bucket
       */
      dispatch(setLoadingMessage('Removing remote Recording file...'));
      const { buckets, bucketKey } = await getBucket();
      const removePathResult = await buckets.removePath(
        bucketKey,
        recording.filename
      );
      console.log('removePathResult:', removePathResult);
    } catch (err) {
      console.error('Could not remove file from Textile bucket:', err);
      dispatch(deleteRecordingFailure(err));
    }

    try {
      /**
       * Remove Recording object in storage
       */
      dispatch(setLoadingMessage('Removing local Recording file...'));
      const ipcResponse = await ipc.send('storage:delete_one', {
        data: recording,
      });
      console.log('deleteRecording, ipcResponse:', ipcResponse);
    } catch (err) {
      console.error('Could not remove Recording file locally:', err);
      dispatch(deleteRecordingFailure(err));
    }

    try {
      /**
       * Delete record in IDB
       */
      dispatch(setLoadingMessage('Updating database...'));

      await db.delete(RECORDING_COLLECTION, recordingId);

      dispatch(deleteRecordingSuccess(recordingId));
      await db.push(RECORDING_COLLECTION);
    } catch (err) {
      console.error('Could not remove IPFS path:', err);

      dispatch(deleteRecordingFailure(err));
    }
    dispatch(setLoadingMessage(null));
  };

export const getBucketToken = (): Effect => async (dispatch) => {
  dispatch(getBucketTokenRequest());
  dispatch(setLoadingMessage('Loading token...'));

  try {
    const { token } = await getBucket();
    dispatch(getBucketTokenSuccess(token));
  } catch (err) {
    dispatch(getBucketTokenFailure(err));
  }
};

export const loadAccountToken =
  (tokenString: string): Effect =>
  async (dispatch) => {
    dispatch(loadAccountTokenRequest());

    try {
      localStorage.setItem(IDENTITY_STORE, tokenString);

      dispatch(setLoadingMessage('Cleaning up local database...'));
      await db.deleteDB();

      dispatch(setLoadingMessage('Initializing new database...'));
      await db.init();

      dispatch(loadAccountTokenSuccess(tokenString));
      dispatch(setLoadingMessage(null));
    } catch (err) {
      console.error('Could not load account token:', err);
      dispatch(loadAccountTokenFailure(err));
    }
  };

export const initDatabase = (): Effect => async (dispatch) => {
  dispatch(initDatabaseRequest());
  try {
    await db.init();
    console.log('Database initialized');
    dispatch(initDatabaseSuccess());
  } catch (err) {
    console.error('Could not initialize database:', err);
    dispatch(initDatabaseFailure(err));
  }
};
