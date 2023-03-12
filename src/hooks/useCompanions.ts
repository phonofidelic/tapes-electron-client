import { useEffect, useState } from 'react';
import { Companion } from '@/common/Companion.interface';
import { useOrbitConnection } from '@/contexts/OrbitdbConnectionContext';

export default function useCompanions() {
  const connection = useOrbitConnection();
  const [companions, setCompanions] = useState<Companion[] | null>(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!connection) {
      throw new Error(
        'No OrbitDB connection established. `useCompanions must be used within an `OrbitConnectionProvider`.`'
      );
    }

    if (!connection.initialized) {
      return;
    }

    try {
      const companions = connection.companions.all;

      const companionsArray = Object.keys(companions).map((key: string) => ({
        dbAddress: companions[key].dbAddress,
        deviceName: companions[key].deviceName,
        docStores: companions[key].docStores,
        nodeId: companions[key].nodeId,
        status: companions[key].status,
      }));

      console.log('### companions', companionsArray);
      setCompanions(companionsArray);
    } catch (error) {
      console.error(error);
      setError(new Error('Could not load companions'));
    }
  }, [connection.initialized]);

  return [companions, false, error];
}
