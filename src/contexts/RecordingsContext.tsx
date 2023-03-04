import React, { createContext, useEffect, useState, useContext } from 'react';
import { useOrbitConnection } from '@/contexts/OrbitdbConnectionContext';
import { RECORDING_COLLECTION } from '@/common/constants';
import { Recording } from '@/common/Recording.interface';
import { RecordingRepository } from '@/db/Repository';

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

export const useRecordings = (): [
  Recording[],
  boolean,
  Error | null,
  {
    loadRecordings: () => Promise<void>;
    addRecording: (recordingData: Recording) => Promise<void>;
  }
] => {
  const recordingsRepository =
    useContext<RecordingRepository>(RecordingsContext);
  if (recordingsRepository === null) {
    throw new Error('`useRecordings` must be inside a `RecordingsProvider`');
  }
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [connection] = useOrbitConnection();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRecordings = async () => {
    try {
      const results = await recordingsRepository.find({});

      setRecordings([...recordings, ...results]);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setError(new Error('Could not load recordings'));
      setLoading(false);
    }
  };

  const addRecording = async (recordingData: Recording) => {
    if (!connection) {
      throw new Error('No OrbitDb connection established');
    }

    const createdRecording = await recordingsRepository.add(recordingData);
    setRecordings([...recordings, createdRecording]);
  };

  useEffect(() => {
    if (!connection.initialized) {
      return;
    }

    loadRecordings();
  }, []);

  return [recordings, loading, error, { loadRecordings, addRecording }];
};
