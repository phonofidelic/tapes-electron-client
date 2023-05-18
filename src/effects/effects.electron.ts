import { ThunkAction } from 'redux-thunk';
import { RecorderState, RecorderAction } from '@/store/types';
import {
  setInputDeviceRequest,
  setInputDeviceSuccess,
  setInputDeviceFailure,
  downloadRecordingSucess,
  downloadRecordingRequest,
  cacheRecordingRequest,
  cacheRecordingSuccess,
  cacheRecordingFailure,
  pauseRecording,
  playRecording,
  getRecordingStorageStatusRequest,
  getRecordingStorageStatusFailure,
  getRecordingStorageStatusSuccess,
} from '@/store/actions';
import {
  Recording,
  RecordingStorageStatus,
} from '@/common/Recording.interface';
import { IpcService } from '@/IpcService';

const ipc = new IpcService();

type Effect = ThunkAction<void, RecorderState, unknown, RecorderAction>;

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
    } catch (error) {
      dispatch(setInputDeviceFailure(error));
    }

    dispatch(setInputDeviceSuccess());
  };

// TODO: re-implement
export const downloadRecording =
  // prettier-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_recordingId: string): Effect =>
    async (dispatch) => {
      dispatch(downloadRecordingRequest());
      // try {
      //   const { token } = await getBucket();

      //   const recordingData = (await db.findById(
      //     RECORDING_COLLECTION,
      //     recordingId
      //   )) as unknown as Recording;
      //   console.log('downloadRecording, recordingData:', recordingData);

      //   const response = await fetch(
      //     recordingData.remoteLocation + `?token=${token}`,
      //     { method: 'GET' }
      //   );

      //   const blob = await response.blob();

      //   const a = document.createElement('a');
      //   a.href = URL.createObjectURL(blob);
      //   a.download = `${recordingData.title}.${recordingData.format}`;
      //   document.body.appendChild(a);
      //   a.click();
      //   document.body.removeChild(a);

      //   console.log('downloadRecording, response:', response);
      // } catch (err) {
      //   console.error('Could not download recording:', err);
      //   dispatch(
      //     downloadRecordingFailue(new Error('Could not download recording'))
      //   );
      // }

      dispatch(downloadRecordingSucess());
      console.log('TODO: Re-implement downloadRecording');
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

export const getRecordingStorageStatus =
  (recordingCid: string): Effect =>
  async (dispatch) => {
    dispatch(getRecordingStorageStatusRequest());
    try {
      const {
        recordingStorageStatus,
      }: { recordingStorageStatus: RecordingStorageStatus } = await ipc.send(
        'storage:get_recording_stats',
        { data: recordingCid }
      );
      console.log('recordingStorageStatus:', recordingStorageStatus);
      dispatch(getRecordingStorageStatusSuccess(recordingStorageStatus));
    } catch (err) {
      dispatch(getRecordingStorageStatusFailure(err));
    }
  };
