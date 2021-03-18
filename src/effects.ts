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

const ipc = new IpcService();

type Effect = ThunkAction<void, RecorderState, unknown, RecorderAction>;

export const startRecording = (): Effect => async (dispatch) => {
  dispatch(startRecordingRequest());

  let ipcResponse: { data: Recording, error?: Error };
  try {
    ipcResponse = await ipc.send('recorder:start');
    console.log('recorder:start, ipcResponse:', ipcResponse);

    const recordingData = ipcResponse.data;

    const recordingCount = await db.recordings.count();
    console.log('recordingCount:', recordingCount);

    const recordingDoc = await db.recordings.add(
      new RecordingModel(
        recordingData.location,
        `Recording #${recordingCount + 1}`,
        recordingData.size
      )
    );
    console.log('*** recordingDoc:', recordingDoc);
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
  try {
    dispatch(deleteRecordingRequest(recordingId));
    /**
     * Get data for Recording to delete
     */
    const recording = await db.recordings.get(recordingId);
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
    console.log(err);
    dispatch(deleteRecordingFailure(err));
  }
};
