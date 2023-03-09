import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useOrbitConnection } from '@/contexts/OrbitdbConnectionContext';
import { AccountInfo } from '@/common/AccountInfo.interface';
import { RECORDING_COLLECTION } from '@/common/constants';
import { setLoadingMessage } from '@/store/actions';

export default function useUser() {
  const [connection] = useOrbitConnection();
  const [user, setUser] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();

  const setAccountInfo = async (key: keyof AccountInfo, value: string) => {
    setLoading(true);

    try {
      await connection.user.set(key, value);
      setUser(connection.user.all);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setError(new Error('Could not set account info'));
    }
  };

  const confirmError = () => {
    setError(null);
  };

  useEffect(() => {
    if (!connection) {
      throw new Error(
        'No OrbitDB connection established. `useUser must be used within an `OrbitConnectionProvider`.`'
      );
    }

    setLoading(true);
    dispatch(setLoadingMessage('Loading account info...'));

    async function loadAccountInfo() {
      try {
        const recordingsDb = (await connection.orbitdb.determineAddress(
          RECORDING_COLLECTION,
          'docstore'
        )) as unknown as { root: string; path: string };

        setUser({ ...connection.user.all, recordingsDb });
        setLoading(false);
        setLoadingMessage(null);
      } catch (error) {
        console.error(error);
        setLoading(false);
        setLoadingMessage(null);
        setError(new Error('Could not load account info'));
      }
    }
    loadAccountInfo();
  }, []);

  return [user, loading, error, { setAccountInfo, confirmError }];
}
