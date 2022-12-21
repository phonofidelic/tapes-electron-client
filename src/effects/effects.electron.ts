import { ThunkAction } from 'redux-thunk';
import { RecorderState, RecorderAction } from '@/store/types';
import {
  startRecordingRequest,
  startRecordingSuccess,
  loadRecordingsRequest,
  loadRecordingsSuccess,
  loadRecordingsFailure,
  deleteRecordingRequest,
  deleteRecordingSuccess,
  deleteRecordingFailure,
  stopRecordingRequest,
  stopRecordingFailure,
  addRecordingRequest,
  addRecordingSuccess,
  addRecordingFailure,
  editRecordingRequest,
  editRecordingSuccess,
  editRecordingFailure,
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
  downloadRecordingRequest,
  cacheRecordingRequest,
  cacheRecordingSuccess,
  cacheRecordingFailure,
  pauseRecording,
  playRecording,
  getRecordingStorageStatusRequest,
  getRecordingStorageStatusFailure,
  getRecordingStorageStatusSuccess,
  loadAccountInfoRequest,
  loadAccountInfoFailure,
  loadAccountInfoSuccess,
  setAccountInfoRequest,
  setAccountInfoFailure,
  setAccountInfoSuccess,
  getCompanionsRequest,
  getCompanionsFailure,
  getCompanionsSuccess,
} from '@/store/actions';
import {
  Recording,
  RecordingStorageStatus,
} from '@/common/Recording.interface';
import { RecordingSettings } from '@/common/RecordingSettings.interface';
import { RECORDING_COLLECTION, IDENTITY_STORE } from '@/common/constants';
import { IpcService } from '@/IpcService';
import { AccountInfo } from '@/common/AccountInfo.interface';
import { Companion } from '@/common/Companion.interface';
import OrbitConnection from '@/db/OrbitConnection';
import { RecordingRepository } from '@/db/Repository';

const ipc = new IpcService();

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

    const createdRecordings: Recording[] = [];
    for await (const recordingData of ipcResponse.data) {
      console.log(`Creating database entry for ${recordingData.title}`);
      try {
        // const docId = await window.db.add('recordings', recordingData);
        // const createdRecording = await window.db.findById('recordings', docId);

        // const connection = await OrbitConnection.connection();
        await OrbitConnection.Instance.connect();
        const repository = new RecordingRepository(
          OrbitConnection.Instance,
          RECORDING_COLLECTION
        );
        const createdRecording = await repository.add(recordingData);

        createdRecordings.push(createdRecording);
      } catch (err) {
        console.error(
          `Could not create database entry for ${recordingData.title}:`,
          err
        );
        dispatch(
          uploadRecordingsFailure(
            new Error(
              `Could not create database entry for ${recordingData.title}`
            )
          )
        );
      }
    }

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

      if (ipcResponse.error) {
        console.error(ipcResponse.error);
        throw ipcResponse.error;
      }

      recordingData = ipcResponse.recordingData;

      // const docId = await window.db.add('recordings', recordingData);
      // console.log('docId:', docId);
      // createdRecording = await window.db.findById('recordings', docId);

      // const connection = await OrbitConnection.connection();
      await OrbitConnection.Instance.connect();
      const repository = new RecordingRepository(
        OrbitConnection.Instance,
        RECORDING_COLLECTION
      );

      createdRecording = await repository.add(recordingData);

      console.log('createdRecording:', createdRecording);
      dispatch(startRecordingSuccess(createdRecording));

      dispatch(addRecordingSuccess(createdRecording));
      dispatch(setLoadingMessage(null));
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

export const loadRecordings =
  (recordingsAddrRoot: string | undefined): Effect =>
  async (dispatch) => {
    dispatch(loadRecordingsRequest());

    try {
      // const recordings = await window.db.find('recordings', {});

      dispatch(setLoadingMessage('Initializing database...'));
      await OrbitConnection.Instance.connect();

      console.log('load recordings, recordingsAddrRoot', recordingsAddrRoot);

      const repository = new RecordingRepository(
        OrbitConnection.Instance,
        RECORDING_COLLECTION,
        recordingsAddrRoot + `/${RECORDING_COLLECTION}`
      );

      dispatch(setLoadingMessage('Loading library...'));
      const recordings = await repository.find({});

      dispatch(loadRecordingsSuccess(recordings));
      dispatch(setLoadingMessage(null));
    } catch (err) {
      console.error(err);
      dispatch(loadRecordingsFailure(new Error('Could not load recordings')));
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
    dispatch(deleteRecordingRequest(recordingId));

    try {
      dispatch(setLoadingMessage('Deleting recording...'));
      // const connection = await OrbitConnection.connection();
      await OrbitConnection.Instance.connect();
      const repository = new RecordingRepository(
        OrbitConnection.Instance,
        RECORDING_COLLECTION
      );

      // const recording = (await window.db.findById(
      //   'recordings',
      //   recordingId
      // )) as unknown as Recording;
      const recording = await repository.findById(recordingId);

      const deleteRecordingResponse = await ipc.send('recordings:delete_one', {
        data: { recording },
      });
      console.log('deleteRecordingResponse:', deleteRecordingResponse);

      // await window.db.delete('recordings', recordingId);
      await repository.delete(recordingId);

      dispatch(deleteRecordingSuccess(recordingId));
    } catch (err) {
      console.error('Could not delete recording:', err);

      dispatch(deleteRecordingFailure(err));
    }
    dispatch(setLoadingMessage(null));
  };

export const loadAccountToken =
  (tokenString: string): Effect =>
  async (dispatch) => {
    dispatch(loadAccountTokenRequest());

    try {
      localStorage.setItem(IDENTITY_STORE, tokenString);

      dispatch(setLoadingMessage('Cleaning up local database...'));
      await window.db.deleteDB();

      dispatch(setLoadingMessage('Initializing new database...'));
      !window.db.initialized && (await window.db.init());

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

  try {
    await OrbitConnection.Instance.connect();

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

// TODO: re-implement
export const downloadRecording =
  (recordingId: string): Effect =>
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

// TODO: Remove if unused
export const exportIdentity = (): Effect => async (dispatch) => {
  console.log('exporting identity...');
  await ipc.send('identity:export');
};

export const loadAccountInfo = (): Effect => async (dispatch) => {
  dispatch(loadAccountInfoRequest());
  try {
    dispatch(setLoadingMessage('Loading account info...'));
    await OrbitConnection.Instance.connect();
    const userRepository = OrbitConnection.Instance.user;

    const recordingsRepository = new RecordingRepository(
      OrbitConnection.Instance,
      RECORDING_COLLECTION
    );

    const accountInfo = {
      ...userRepository.all,
      recordingsDb: await recordingsRepository.getAddress(),
    };

    console.log('loadAccountInfo, accountInfo:', accountInfo);

    dispatch(loadAccountInfoSuccess(accountInfo));
    dispatch(setLoadingMessage(null));
  } catch (err) {
    console.error('Could not load account info:', err);
    return dispatch(
      loadAccountInfoFailure(new Error('Could not load account info'))
    );
  }

  dispatch(getCompanionsRequest);

  try {
    dispatch(setLoadingMessage('Loading companions status...'));
    const companions = OrbitConnection.Instance.companions.all;

    const companionsArray: Companion[] = Object.keys(companions).map(
      (key: string) => ({
        dbAddress: companions[key].dbAddress,
        deviceName: companions[key].deviceName,
        docStores: companions[key].docStores,
        nodeId: companions[key].nodeId,
        status: companions[key].status,
      })
    );

    dispatch(getCompanionsSuccess(companionsArray));
    dispatch(setLoadingMessage(null));
  } catch (err) {
    console.error('Could not retrieve companions:', err);
    dispatch(getCompanionsFailure(new Error('Could not retrieve companions')));
  }
};

export const setAccountInfo =
  (key: keyof AccountInfo, value: string): Effect =>
  async (dispatch) => {
    dispatch(setAccountInfoRequest());

    try {
      // await window.db.setAccountInfo(key, value);
      // const updatedAccountInfo = window.db.getAccountInfo();
      const userRepository = OrbitConnection.Instance.user;

      userRepository.set(key, value);
      const updatedAccountInfo = userRepository.all as unknown as AccountInfo;

      dispatch(setAccountInfoSuccess(updatedAccountInfo));
    } catch (err) {
      console.error('Could not set account info:', err);
      dispatch(setAccountInfoFailure(new Error('Could not set account info')));
    }
  };

export const getCompanions = (): Effect => async (dispatch) => {
  dispatch(getCompanionsRequest);

  try {
    // const companions = window.db.getAllCompanions();

    dispatch(setLoadingMessage('Loading companions status...'));
    // const connection = await OrbitConnection.connection();
    // const companionsRepo = new CompanionRepository(connection, 'companions');
    // await companionsRepo.init();
    // // const companions = (await connection.keyvalue<Companion>('companions')).all;

    // const companions = await companionsRepo.all();
    await OrbitConnection.Instance.connect();
    const companions = OrbitConnection._instance.companions.all;

    const companionsArray: Companion[] = Object.keys(companions).map(
      (key: string) => ({
        dbAddress: companions[key].dbAddress,
        deviceName: companions[key].deviceName,
        docStores: companions[key].docStores,
        nodeId: companions[key].nodeId,
        status: companions[key].status,
      })
    );

    dispatch(getCompanionsSuccess(companionsArray));
    dispatch(setLoadingMessage(null));
  } catch (err) {
    console.error('Could not retrieve companions:', err);
    dispatch(getCompanionsFailure(new Error('Could not retrieve companions')));
  }
};
