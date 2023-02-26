import React, { createContext, useEffect, useState, useContext } from 'react';
import { useOrbitConnection } from '@/contexts/OrbitdbConnectionContext';
import { RECORDING_COLLECTION } from '@/common/constants';
import { Recording } from '@/common/Recording.interface';
import { RecordingRepository } from '@/db/Repository';
import OrbitConnection from '../db/OrbitConnection';

const RecordingsContext = createContext(null);

export const RecordingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [recordings, setRecordings] = useState([]);

  return (
    <RecordingsContext.Provider value={[recordings, setRecordings]}>
      {children}
    </RecordingsContext.Provider>
  );
};

export const useRecordings = (): [
  Recording[],
  boolean,
  Error | null,
  { addRecording: (recordingData: Recording) => Promise<void> }
] => {
  const recordingsContext = useContext(RecordingsContext);
  if (recordingsContext === null) {
    throw new Error('`useRecordings` must be inside a `RecordingsProvider`');
  }
  const [recordings, setRecordings] = recordingsContext;
  const [connection] = useOrbitConnection();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getRecordingsRepository = (connection: OrbitConnection) => {
    return new RecordingRepository(connection, RECORDING_COLLECTION);
  };

  const addRecording = async (recordingData: Recording) => {
    if (!connection) {
      throw new Error('No OrbitDb connection established');
    }

    const recordingsRepository = getRecordingsRepository(connection);

    const createdRecording = await recordingsRepository.add(recordingData);
    console.log('createdRecording:', createdRecording);
    setRecordings([...recordings, createdRecording]);
  };

  useEffect(() => {
    if (!connection.initialized) {
      return;
    }
    const recordingsRepository = getRecordingsRepository(connection);

    async function loadRecordings() {
      try {
        const recordings = await recordingsRepository.find({});

        setRecordings(recordings);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError(new Error('Could not load recordings'));
        setLoading(false);
      }
    }
    loadRecordings();
  }, [connection.initialized]);
  console.log('### recordings', recordings);

  return [recordings, loading, error, { addRecording }];
};
