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
  uploadRecordingsRequest,
  uploadRecordingsFailure,
  uploadRecordingsSuccess,
  setInputDeviceRequest,
  setInputDeviceSuccess,
  setInputDeviceFailure,
  downloadRecordingSucess,
  downloadRecordingFailue,
  downloadRecordingRequest,
  cacheRecordingRequest,
  cacheRecordingSuccess,
  cacheRecordingFailure,
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

const addRemoteRecording = async (
  recordingData: Recording
): Promise<Recording> => {
  const { buckets, bucketKey, threadId } = await getBucket();
  /**
   * Push audio data to IPFS
   */
  if (!recordingData.fileData)
    throw new Error('No file data for ' + recordingData.title);
  const pushPathResult = await buckets.pushPath(
    bucketKey,
    recordingData.filename,
    await recordingData.fileData
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
    recordingData.title,
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

  return createdRecording;
};
/** End Textile utils */

type Effect = ThunkAction<void, RecorderState, unknown, RecorderAction>;

export const uploadAudioFiles =
  (audioFiles: File[]): Effect =>
  async (dispatch) => {
    dispatch(uploadRecordingsRequest());
    dispatch(setLoadingMessage('Processing audio files...'));
    console.log('uploadAudioFiles, audioFiles:', audioFiles);

    /**
     * Parse data needed for Recording object
     */
    const parsedFiles = audioFiles.map((file) => ({
      path: file.path,
      name: file.name,
      size: file.size,
    }));

    /**
     * Get Recordings with metadata from files
     */
    let ipcResponse: { message: string; data: Recording[]; error?: Error };
    try {
      ipcResponse = await ipc.send('storage:upload', {
        data: { files: parsedFiles },
      });
      console.log('uploadAudioFiles, response:', ipcResponse);
      if (ipcResponse.error) throw ipcResponse.error;
    } catch (err) {
      console.error('Could not upload audio files:', err.message);
      return dispatch(uploadRecordingsFailure(err));
    }

    let createdRecordings = [];
    try {
      for await (let recordingData of ipcResponse.data) {
        dispatch(setLoadingMessage(`Uploading "${recordingData.title}"`));
        const createdRecording = await addRemoteRecording(recordingData);
        createdRecordings.push(createdRecording);
      }
      await db.push(RECORDING_COLLECTION);
    } catch (err) {
      console.error('Could not push audio files to remote:', err);
      return dispatch(uploadRecordingsFailure(err));
    }

    dispatch(uploadRecordingsSuccess(createdRecordings));
    dispatch(setLoadingMessage(null));
  };

export const startRecording =
  (recordingSettings: RecordingSettings): Effect =>
  async (dispatch) => {
    dispatch(startRecordingRequest());

    const recordingCount = (await db.find(RECORDING_COLLECTION, {})).length;
    console.log('recordingCount:', recordingCount);

    const title = `Recording #${recordingCount + 1}`;

    let ipcResponse: { data: Recording; file?: any; error?: Error };
    let recordingData;
    try {
      ipcResponse = await ipc.send('recorder:start', {
        data: { recordingSettings, title },
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

      const createdRecording = await addRemoteRecording(recordingData);

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

export const setInputDevice =
  (deviceName: string): Effect =>
  async (dispatch) => {
    console.log('setInputDevice, deviceName:', deviceName);
    dispatch(setInputDeviceRequest());

    let ipcResponse: { message: string; error?: Error };
    try {
      ipcResponse = await ipc.send('recorder:set-input', { data: deviceName });

      console.log('recorder:set-input, ipcResponse:', ipcResponse);

      if (ipcResponse.error) {
        throw ipcResponse.error;
      }
    } catch (err) {
      dispatch(setInputDeviceFailure(err));
    }

    dispatch(setInputDeviceSuccess());
  };

export const downloadRecording =
  (recordingId: string): Effect =>
  async (dispatch) => {
    dispatch(downloadRecordingRequest());
    try {
      const { token } = await getBucket();

      const recordingData = (await db.findById(
        RECORDING_COLLECTION,
        recordingId
      )) as unknown as Recording;
      console.log('downloadRecording, recordingData:', recordingData);

      const response = await fetch(
        recordingData.remoteLocation + `?token=${token}`,
        { method: 'GET' }
      );

      const blob = await response.blob();

      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${recordingData.title}.${recordingData.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      console.log('downloadRecording, response:', response);
    } catch (err) {
      console.error('Could not download recording:', err);
      dispatch(
        downloadRecordingFailue(new Error('Could not download recording'))
      );
    }

    dispatch(downloadRecordingSucess());
  };

export const cacheAndPlayRecording =
  (recordingId: string): Effect =>
  async (dispatch) => {
    dispatch(cacheRecordingRequest());
    try {
      const { token } = await getBucket();

      const recordingData = (await db.findById(
        RECORDING_COLLECTION,
        recordingId
      )) as unknown as Recording;

      const ipcResponse = await ipc.send('storage:cache_recording', {
        data: { recordingData, token },
      });

      console.log('cacheRecording, ipcResponse:', ipcResponse);
      dispatch(cacheRecordingSuccess());

      const audio = <HTMLAudioElement>document.getElementById(recordingId);
      audio.load();
      audio.play();
    } catch (err) {
      console.error('Could not cache recording:', err);
      dispatch(cacheRecordingFailure(err));
    }
  };
