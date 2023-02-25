import { useEffect, useState } from 'react';
import { useOrbitConnection } from '@/contexts/OrbitdbConnectionContext';
import { RECORDING_COLLECTION } from '@/common/constants';
import { Recording } from '@/common/Recording.interface';
import { RecordingRepository } from '@/db/Repository';

export const useRecordings = (): [Recording[], boolean, Error | null] => {
  const [connection] = useOrbitConnection();
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!connection.initialized) {
      return;
    }

    const recordingsRepository = new RecordingRepository(
      connection,
      RECORDING_COLLECTION
    );

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

  return [recordings, loading, error];
};
