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
  pauseRecording,
  playRecording,
  getRecordingStorageStatusRequest,
  getRecordingStorageStatusFailure,
  getRecordingStorageStatusSuccess,
} from './store/actions';
// import { browserDB as db, RecordingModel } from './db';
import { Recording, RecordingStorageStatus } from './common/Recording.interface';
import { RecordingSettings } from './common/RecordingSettings.interface';
import { RECORDING_COLLECTION, IDENTITY_STORE } from './common/constants';
import { IpcService } from './IpcService';
import { Buckets, KeyInfo, PrivateKey } from '@textile/hub';
import { db } from './db/db-orbit'
import { RecordingModel } from './db/recording.model';
// const db = window.db
// const db: any = {}


// const THREADS_DB_NAME = 'tapes-thread-db';
// const RECORDING_COLLECTION = 'Recording';

const REQUEST_TIMEOUT = 60000;

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

// const addRemoteRecording = async (
//   recordingData: Recording
// ): Promise<Recording> => {
//   console.log('Adding audio file to remote bucket...');
//   const { buckets, bucketKey, threadId } = await getBucket();
//   console.log('threadId:', threadId);
//   /**
//    * Push audio data to IPFS
//    */
//   if (!recordingData.fileData) {
//     console.error('No file data for ' + recordingData.title);
//     throw new Error('No file data for ' + recordingData.title);
//   }

//   let pushPathResult;
//   try {
//     const abortController = new AbortController();
//     const timeoutId = setTimeout(() => {
//       console.log('*** ran out of time! ***');
//       abortController.abort();

//       throw new Error('Push path request timed out');
//     }, REQUEST_TIMEOUT);

//     pushPathResult = await buckets.pushPath(
//       bucketKey,
//       recordingData.filename,
//       {
//         path: '/' + recordingData.filename,
//         content: recordingData.fileData,
//       },
//       {
//         progress: (prog) => {
//           // console.log('Push progress:', prog);
//         },
//         signal: abortController.signal,
//       }
//     );
//     clearTimeout(timeoutId);
//     console.log('pushPathResult:', pushPathResult);
//   } catch (err) {
//     console.error('Could not push audio file to remote bucket:', err);
//     throw new Error('Could not push audio file to remote bucket');
//   }

//   /**
//    * Set remote Textile Bucket location
//    */
//   const remoteLocation =
//     IPFS_GATEWAY +
//     '/thread/' +
//     threadId +
//     '/buckets/' +
//     bucketKey +
//     '/' +
//     recordingData.filename;

//   const recordingDoc = new RecordingModel(
//     recordingData.location,
//     recordingData.filename,
//     recordingData.title,
//     recordingData.size,
//     recordingData.format,
//     recordingData.channels,
//     recordingData.duration,
//     remoteLocation,
//     null,
//     recordingData.common,
//     recordingData.acoustidResults,
//     recordingData.musicBrainzCoverArt
//   );

//   /**
//    * Add recording doc to Textile DB
//    */
//   console.log('Adding recording doc to Textile DB...');
//   const newRecordingId = await db.add(RECORDING_COLLECTION, recordingDoc);
//   console.log('recordingDoc:', recordingDoc);

//   /**
//    * Update recording doc with remoteLocation
//    */
//   await db.update(RECORDING_COLLECTION, newRecordingId, {
//     remoteLocation,
//     bucketPath: pushPathResult.path.path,
//   });

//   const createdRecording = (await db.findById(
//     RECORDING_COLLECTION,
//     newRecordingId
//   )) as unknown as Recording;

//   return createdRecording;
// };
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

      let createdRecordings: Recording[] = [];
      // const createdRecordings = ipcResponse.data;
      for await (let recordingData of ipcResponse.data) {
        console.log(`Creating database entry for ${recordingData.title}`)
        try {
          const docId = await db.add('recordings', recordingData)
          const createdRecording = await db.findById('recordings', docId)
          createdRecordings.push(createdRecording)
        } catch (err) {
          console.error(`Could not create database entry for ${recordingData.title}:`, err)
          dispatch(uploadRecordingsFailure(new Error(`Could not create database entry for ${recordingData.title}`)))
        }
      }

      // try {
      //   for await (let recordingData of ipcResponse.data) {
      //     console.log(`Uploading "${recordingData.title}"`);
      //     dispatch(setLoadingMessage(`Uploading "${recordingData.title}"`));
      //     const createdRecording = await addRemoteRecording(recordingData);
      //     createdRecordings.push(createdRecording);
      //   }
      //   console.log('Updating remote DB...');
      //   await db.push(RECORDING_COLLECTION);
      // } catch (err) {
      //   console.error('Could not push audio files to remote:', err);
      //   return dispatch(uploadRecordingsFailure(err));
      // }

      dispatch(uploadRecordingsSuccess(createdRecordings));
      dispatch(setLoadingMessage(null));
    };

export const startRecording =
  (recordingSettings: RecordingSettings): Effect =>
    async (dispatch) => {
      dispatch(startRecordingRequest());

      let ipcResponse: { recordingData: Recording; file?: any; error?: Error };
      let recordingData;
      let createdRecording;
      try {
        ipcResponse = await ipc.send('recorder:start', {
          data: { recordingSettings },
        });
        console.log('recorder:start, ipcResponse:', ipcResponse);

        recordingData = ipcResponse.recordingData;
        const docId = await db.add('recordings', recordingData)
        console.log('docId:', docId)
        createdRecording = await db.findById('recordings', docId)

        console.log('createdRecording:', createdRecording);
        dispatch(startRecordingSuccess(createdRecording));
        if (ipcResponse.error) {
          throw ipcResponse.error;
        }
        dispatch(addRecordingSuccess(createdRecording));
        dispatch(setLoadingMessage(null));
      } catch (err) {
        return dispatch(startRecordingFailure(err));
      }

      try {
        // dispatch(addRecordingRequest());
        // dispatch(setLoadingMessage('Storing file on IPFS...'));

        /**
         * TODO: Re-implement remote storage with Web3.Storage in NewRecordingChannel
         */
        // createdRecording = await addRemoteRecording(recordingData);

        // dispatch(addRecordingSuccess(createdRecording));
        // dispatch(setLoadingMessage(null));
      } catch (err) {
        console.error('addRecordingRequest error:', err);
        dispatch(addRecordingFailure(err));
        dispatch(setLoadingMessage(null));
      }
    };

export const stopRecording = (): Effect => async (dispatch) => {
  dispatch(stopRecordingRequest());

  try {
    ipc.send('recorder:stop');
    console.log('recorder:stop');
    // dispatch(stopRecordingSuccess());
    dispatch(addRecordingRequest());
    dispatch(setLoadingMessage('Storing file on IPFS...'));
  } catch (err) {
    dispatch(stopRecordingFailure(err));
  }
};

export const loadRecordings = (): Effect => async (dispatch) => {
  dispatch(loadRecordingsRequest());

  try {
    dispatch(setLoadingMessage('Loading library...'));
    // const { recordings } = await ipc.send('recordings:get_all') as { recordings: Recording[] };
    const recordings = await db.find('recordings', {})

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
        const updatedRecording = await db.update('recordings', recordingId, update)
        // const { updatedRecording } = await ipc.send('recordings:update', { data: { recordingId, update } }) as { updatedRecording: Recording };
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

      try {
        dispatch(setLoadingMessage('Updating database...'));

        const recording = await db.findById('recordings', recordingId) as unknown as Recording;

        const deleteRecordingResponse = await ipc.send('recordings:delete_one', { data: { recording } })
        console.log('deleteRecordingResponse:', deleteRecordingResponse)

        await db.delete('recordings', recordingId)

        dispatch(deleteRecordingSuccess(recordingId));
      } catch (err) {
        console.error('Could not delete recording:', err);

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
  dispatch(setLoadingMessage('Initializing database...'));

  let ipcResponse: { databaseInstance: any };
  try {
    // ipcResponse = await ipc.send('database:create')
    // console.log('*** Create DB response:', ipcResponse)

    window.db = await db.init()
  } catch (err) {
    console.error('Could not create database:', err)
  }

  try {
    // await db.init();
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
  (recording: Recording): Effect =>
    async (dispatch) => {
      dispatch(pauseRecording());
      dispatch(cacheRecordingRequest(recording));
      try {
        const ipcResponse: { message: string; error?: Error } = await ipc.send(
          'storage:cache_recording',
          {
            data: { recording },
          }
        );

        console.log('cacheRecording, ipcResponse:', ipcResponse);
        if (ipcResponse.error) {
          dispatch(cacheRecordingFailure(ipcResponse.error));
        }

        dispatch(cacheRecordingSuccess());
        dispatch(playRecording());
      } catch (err) {
        console.error('Could not cache recording:', err);
        dispatch(cacheRecordingFailure(err));
      }
    };

export const getRecordingStorageStatus = (recordingCid: string): Effect => async (dispatch) => {
  dispatch(getRecordingStorageStatusRequest())
  try {
    const { recordingStorageStatus }: { recordingStorageStatus: RecordingStorageStatus } = await ipc.send('storage:get_recording_stats', { data: recordingCid })
    console.log('recordingStorageStatus:', recordingStorageStatus)
    dispatch(getRecordingStorageStatusSuccess(recordingStorageStatus))
  } catch (err) {
    dispatch(getRecordingStorageStatusFailure(err))
  }
}

export const exportIdentity = (): Effect => async (dispatch) => {
  console.log('exporting identity...')
  await ipc.send('identity:export')
}