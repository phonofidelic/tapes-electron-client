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
  getBucketInfoRequest,
  getBucketInfoSuccess,
  getBucketInfoFailure,
} from './store/actions';
import { db, RecordingModel } from './db';
import { Recording } from './common/Recording.interface';
import { RecordingSettings } from './common/RecordingSettings.interface';
import { IpcService } from './IpcService';
import {
  Buckets,
  Client,
  Users,
  PushPathResult,
  KeyInfo,
  PrivateKey,
  WithKeyInfoOptions,
  Identity,
  ThreadID,
} from '@textile/hub';

const THREADS_DB_NAME = 'tapes-thread-db';

declare const USER_API_KEY: any;
// console.log('effects, USER_API_KEY:', USER_API_KEY);

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
  const token = await buckets.getToken(identity);

  const buck = await buckets.getOrCreate('com.phonofidelic.tapes', {
    encrypted: true,
  });
  if (!buck.root) {
    throw new Error('Failed to open bucket');
  }
  console.log('buckets:', buckets);
  console.log('buck:', buck);

  return {
    buckets: buckets,
    bucketKey: buck.root.key,
    threadId: buck.threadID,
    token,
  };
};

const getTextileClient = async () => {
  const storedIdent = localStorage.getItem('identity');
  const identity = PrivateKey.fromString(storedIdent);

  const client = await Client.withKeyInfo(keyInfo);
  await client.getToken(identity);

  return client;
};

const getDbThread = async () => {
  const storedIdent = localStorage.getItem('identity');
  const identity = PrivateKey.fromString(storedIdent);

  const user = await Users.withKeyInfo(keyInfo);
  await user.getToken(identity);

  const getThreadResponse = await user.getThread(THREADS_DB_NAME);
  const dbThread = ThreadID.fromString(getThreadResponse.id);

  return dbThread;
};
/** End Textile utils */

type Effect = ThunkAction<void, RecorderState, unknown, RecorderAction>;

export const startRecording = (
  recordingSettigs: RecordingSettings
): Effect => async (dispatch) => {
  dispatch(startRecordingRequest());

  let ipcResponse: { data: Recording; file?: any; error?: Error };
  try {
    ipcResponse = await ipc.send('recorder:start', { data: recordingSettigs });
    console.log('recorder:start, ipcResponse:', ipcResponse);

    const recordingData = ipcResponse.data;
    console.log('recordingData:', recordingData);

    const recordingCount = await db.recordings.count();
    console.log('recordingCount:', recordingCount);

    const title = `Recording #${recordingCount + 1}`;

    /**
     * Push audio data to IPFS
     */
    const { buckets, bucketKey, threadId, token } = await getBucketKey();

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
    // '?token=' +
    // token;

    /**
     * Save recorfing to IndexedDB
     */
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
    const client = await getTextileClient();
    const dbThread = await getDbThread();
    const newRecordingDocs = await client.create(dbThread, 'recordings', [
      recordingDoc,
    ]);
    console.log('newRecordingDocs:', newRecordingDocs);
    const newRecordingId = newRecordingDocs[0];
    recordingDoc.id = newRecordingId;

    await db.recordings.add(recordingDoc);
    console.log('recordingDoc:', recordingDoc);

    /**
     * Update recording doc with remoteLocation
     */
    await db.recordings.update(newRecordingId, {
      remoteLocation,
      bucketPath: pushPathResult.path.path,
    });

    const threadRecordingDoc: Recording = await client.findByID(
      dbThread,
      'recordings',
      newRecordingId
    );
    threadRecordingDoc.id = newRecordingId;
    threadRecordingDoc.remoteLocation = remoteLocation;
    await client.save(dbThread, 'recordings', [threadRecordingDoc]);
  } catch (err) {
    console.error('startRecordingRequest error:', err);
    dispatch(startRecordingFailure(err));
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

  const client = await getTextileClient();
  const dbThread = await getDbThread();
  const textileRecordings = await client.find(dbThread, 'recordings', {});
  console.log('loadRecordings, textileRecordings:', textileRecordings);

  let idbResponse;
  try {
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
  dispatch(deleteRecordingRequest(recordingId));

  let recording;
  try {
    /**
     * Get data for Recording to delete
     */
    recording = await db.recordings.get(recordingId);
    console.log('deleteRecording, recording:', recording);

    /**
     * Delete in Textile bucket
     */
    const { buckets, bucketKey } = await getBucketKey();
    const removePathResult = await buckets.removePath(
      bucketKey,
      recording.filename
    );
    console.log('removePathResult:', removePathResult);

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

    /**
     * Delete record in Textile thread
     */
    const client = await getTextileClient();
    const dbThread = await getDbThread();
    await client.delete(dbThread, 'recordings', [recordingId]);

    dispatch(deleteRecordingSuccess(recordingId));
  } catch (err) {
    console.error('Could not remove IPFS path:', err);

    dispatch(deleteRecordingFailure(err));
  }
};

export const getBucketInfo = (): Effect => async (dispatch) => {
  dispatch(getBucketInfoRequest());

  try {
    const { buckets, bucketKey } = await getBucketKey();
    const links = await buckets.links(bucketKey);
    console.log('links:', links);

    const paths = await buckets.listPathFlat(bucketKey, '');
    console.log('paths:', paths);

    dispatch(
      getBucketInfoSuccess({
        ...links,
      })
    );
  } catch (err) {
    dispatch(getBucketInfoFailure(err));
  }
};
