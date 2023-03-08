import React, { createContext, useEffect, useState, useContext } from 'react';
import { useOrbitConnection } from '@/contexts/OrbitdbConnectionContext';
import { RECORDING_COLLECTION } from '@/common/constants';
import { Recording } from '@/common/Recording.interface';
import { RecordingRepository } from '@/db/Repository';
import { IpcService } from '@/IpcService';
import { useDispatch } from 'react-redux';
import { setLoadingMessage } from '@/store/actions';

const RecordingsContext = createContext(null);

export const RecordingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const searchParams = new URLSearchParams(window.location.search);
  const desktopPeerId = searchParams.get('peerid');
  const recordingsAddrRoot = searchParams.get('address');
  const [connection] = useOrbitConnection(desktopPeerId, recordingsAddrRoot);

  const repository = new RecordingRepository(connection, RECORDING_COLLECTION);

  return (
    <RecordingsContext.Provider value={repository}>
      {children}
    </RecordingsContext.Provider>
  );
};

type UseRecordingsReturn = [
  Recording[],
  boolean,
  Error | null,
  {
    loadRecordings: () => Promise<void>;
    addRecording: (recordingData: Recording) => Promise<void>;
    uploadAudioFiles: (audioFiles: File[]) => Promise<void>;
    editRecording: (
      recordingId: string,
      update: Partial<Recording>
    ) => Promise<void>;
    deleteRecording: (recordingId: string) => Promise<void>;
    confirmError: () => void;
  }
];

export const useRecordings = (): UseRecordingsReturn => {
  const recordingsRepository =
    useContext<RecordingRepository>(RecordingsContext);
  if (recordingsRepository === null) {
    throw new Error('`useRecordings` must be inside a `RecordingsProvider`');
  }
  const [connection] = useOrbitConnection();

  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const ipc = new IpcService();

  const loadRecordings = async () => {
    dispatch(setLoadingMessage('Loading recordings'));
    try {
      const results = await recordingsRepository.find({});

      setRecordings([...recordings, ...results]);
      setLoading(false);
      dispatch(setLoadingMessage(null));
    } catch (error) {
      console.error(error);
      setError(new Error('Could not load recordings'));
      setLoading(false);
      dispatch(setLoadingMessage(null));
    }
  };

  const addRecording = async (recordingData: Recording) => {
    if (!connection) {
      throw new Error('No OrbitDb connection established');
    }

    const createdRecording = await recordingsRepository.add(recordingData);
    setRecordings([...recordings, createdRecording]);
  };

  const uploadAudioFiles = async (audioFiles: File[]) => {
    setLoading(true);
    dispatch(
      setLoadingMessage(
        `Processing ${audioFiles.length} audio file${
          audioFiles.length > 1 ? 's' : ''
        }`
      )
    );

    const parsedFiles = audioFiles.map((file) => ({
      path: file.path,
      name: file.name,
      size: file.size,
    }));

    try {
      const ipcResponse = await ipc.send<{
        message: string;
        data: Recording[];
        error?: Error;
      }>('storage:upload', {
        data: { files: parsedFiles },
      });
      if (ipcResponse.error) {
        throw ipcResponse.error;
      }

      const createdRecordings: Recording[] = [];
      for await (const recordingData of ipcResponse.data) {
        try {
          const createdRecording = await recordingsRepository.add(
            recordingData
          );
          createdRecordings.push(createdRecording);
        } catch {
          throw new Error(
            `Could not create database entry for ${recordingData.title}`
          );
        }
      }
      setRecordings([...recordings, ...createdRecordings]);
      setLoading(false);
      dispatch(setLoadingMessage(null));
    } catch (error) {
      console.error(error);
      setLoading(false);
      setError(error);
      dispatch(setLoadingMessage(null));
    }
  };

  const editRecording = async (
    recordingId: string,
    update: Partial<Recording>
  ) => {
    setLoading(true);
    try {
      const updatedRecording = await recordingsRepository.update(
        recordingId,
        update
      );
      setRecordings(
        recordings.map((recording) =>
          recording._id === updatedRecording._id ? updatedRecording : recording
        )
      );
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setError(new Error('Could not update Recording document'));
    }
  };

  const deleteRecording = async (recordingId: string) => {
    setLoading(true);
    try {
      const recording = await recordingsRepository.findById(recordingId);

      await ipc.send('recordings:delete_one', { data: { recording } });
      await recordingsRepository.delete(recordingId);
      setRecordings(
        recordings.filter((recording) => recording._id !== recordingId)
      );
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setError(new Error('Could not delete recording'));
    }
  };

  useEffect(() => {
    if (!connection.initialized) {
      return;
    }

    loadRecordings();
  }, [connection.initialized]);

  return [
    recordings,
    loading,
    error,
    {
      loadRecordings,
      addRecording,
      uploadAudioFiles,
      editRecording,
      deleteRecording,
      confirmError: () => setError(false),
    },
  ];
};
