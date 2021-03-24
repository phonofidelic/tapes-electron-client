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
} from './store/actions';
import { db, RecordingModel } from './db';
import { Recording } from './common/Recording.interface';
import { IpcService } from './IpcService';
import {
  Buckets,
  PushPathResult,
  KeyInfo,
  PrivateKey,
  WithKeyInfoOptions,
  Identity,
} from '@textile/hub';
import { USER_API_KEY } from './keys.json';

const ipc = new IpcService();

/**
 * Textile utils
 *
 * getBucketKey:
 * https://github.com/textileio/js-examples/blob/a8a5a9fe8cf8331f0bc4f811791e15dbc0597469/bucket-photo-gallery/src/App.tsx#L99
 */
const IPFS_GATEWAY = 'https://hub.textile.io';
const keyInfo: KeyInfo = {
  key: USER_API_KEY,
};

// console.log('keyInfo:', keyInfo);

const getBucketKey = async () => {
  const storedIdent = localStorage.getItem('identity');
  const identity = PrivateKey.fromString(storedIdent);

  if (!identity) {
    throw new Error('Identity not set');
    // getIdentity();
  }
  const buckets = await Buckets.withKeyInfo(keyInfo, { debug: true });
  // Authorize the user and your insecure keys with getToken
  await buckets.getToken(identity);

  const buck = await buckets.getOrCreate('com.phonofidelic.tapes', {
    encrypted: true,
  });
  if (!buck.root) {
    throw new Error('Failed to open bucket');
  }
  console.log('buckets:', buckets);
  console.log('buck:', buck);

  return { buckets: buckets, bucketKey: buck.root.key };
};
/** End Textile utils */

type Effect = ThunkAction<void, RecorderState, unknown, RecorderAction>;

export const startRecording = (): Effect => async (dispatch) => {
  dispatch(startRecordingRequest());

  let ipcResponse: { data: Recording; file?: any; error?: Error };
  try {
    ipcResponse = await ipc.send('recorder:start');
    console.log('recorder:start, ipcResponse:', ipcResponse);

    const recordingData = ipcResponse.data;
    console.log('recordingData:', recordingData);

    const recordingCount = await db.recordings.count();
    console.log('recordingCount:', recordingCount);

    const title = `Recording #${recordingCount + 1}`;

    const recordingDoc = await db.recordings.add(
      new RecordingModel(
        recordingData.location,
        recordingData.filename,
        title,
        recordingData.size,
        recordingData.duration
      )
    );
    console.log('recordingDoc:', recordingDoc);

    /**
     * Push audio data to IPFS
     */
    const { buckets, bucketKey } = await getBucketKey();

    const pushPathResult = await buckets.pushPath(
      bucketKey,
      recordingData.filename,
      await ipcResponse.file
    );
    console.log('pushPathResult:', pushPathResult);

    // const remoteLocation = IPFS_GATEWAY + pushPathResult.path.path;
    const remoteLocation =
      IPFS_GATEWAY + pushPathResult.root + '/' + recordingData.filename;

    /**
     * Update recording doc with remoteLocation
     */
    await db.recordings.update(recordingDoc, {
      remoteLocation,
      bucketPath: pushPathResult.path.path,
    });
  } catch (err) {
    console.error('startRecordingRequest error:', err);
    dispatch(startRecordingFailure(err));
  }
};

export const stopRecording = (): Effect => async (dispatch) => {
  dispatch(stopRecordingRequest());

  let ipcResponse;
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

  // let ipcResponse;
  let idbResponse;
  try {
    // ipcResponse = await ipc.send('storage:load');
    // console.log('loadRecordings, ipcResponse:', ipcResponse);

    idbResponse = await db.transaction('r', db.recordings, async () => {
      return await db.recordings.toArray();
    });

    dispatch(loadRecordingsSuccess(idbResponse));
  } catch (err) {
    console.error(err);
    dispatch(loadRecordingsFailure(err));
  }
};

export const deleteRecording = (recordingId: string): Effect => async (
  dispatch
) => {
  let recording;
  try {
    dispatch(deleteRecordingRequest(recordingId));
    /**
     * Get data for Recording to delete
     */
    recording = await db.recordings.get(recordingId);
    console.log('deleteRecording, recording:', recording);

    /**
     * Remove Recording object in storage
     */
    const ipcResponse = await ipc.send('storage:delete_one', {
      data: recording,
    });
    console.log('deleteRecording, ipcResponse:', ipcResponse);

    /**
     * Delete record in IDB
     */
    await db.recordings.delete(recordingId);

    dispatch(deleteRecordingSuccess(recordingId));
  } catch (err) {
    console.error(err);
    dispatch(deleteRecordingFailure(err));
  }

  try {
    /**
     * Delete in IPFS
     */
    const { buckets, bucketKey } = await getBucketKey();
    const removePathResult = await buckets.removePath(
      bucketKey,
      recording.filename
    );
    console.log('removePathResult:', removePathResult);
  } catch (err) {
    console.error('Could not remove IPFS path:', err);
  }
};
