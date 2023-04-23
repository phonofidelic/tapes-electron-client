import { useEffect, useState } from 'react';
import { Companion } from '@/common/Companion.interface';
import { useOrbitConnection } from '@/contexts/OrbitdbConnectionContext';

const companionsToArray = (companions: Record<string, Companion>) => {
  return Object.keys(companions).map((key: string) => ({
    dbAddress: companions[key].dbAddress,
    deviceName: companions[key].deviceName,
    // docStores: companions[key].docStores,
    recordingsAddrRoot: companions[key].recordingsAddrRoot,
    nodeId: companions[key].nodeId,
    status: companions[key].status,
  }));
};

export default function useCompanions() {
  const connection = useOrbitConnection();
  const [companions, setCompanions] = useState<Companion[] | null>(null);
  const [error, setError] = useState(null);

  const clearCompanions = async () => {
    try {
      await connection.companions.drop();
      const companions = connection.companions.all;
      const companionsArray = companionsToArray(companions);
      setCompanions(companionsArray);
    } catch (error) {
      setError(new Error('Could not drop companions'));
    }
  };

  useEffect(() => {
    if (!connection) {
      throw new Error(
        'No OrbitDB connection established. `useCompanions` must be used within an `OrbitConnectionProvider`.'
      );
    }

    if (!connection.initialized) {
      return;
    }

    try {
      const companions = connection.companions.all;
      const companionsArray = companionsToArray(companions);
      setCompanions(companionsArray);
    } catch (error) {
      console.error(error);
      setError(new Error('Could not load companions'));
    }

    const onCompanionsWrite = () => {
      const companions = connection.companions.all;
      const companionsArray = companionsToArray(companions);
      setCompanions(companionsArray);
    };
    connection.companions.events.on('write', onCompanionsWrite);

    return () => {
      connection.companions.events.off('write', onCompanionsWrite);
    };
  }, [connection.initialized]);

  return [companions, false, error, { clearCompanions }];
}
