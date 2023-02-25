import OrbitConnection from '@/db/OrbitConnection';
import React, { createContext, useContext, useEffect, useState } from 'react';

const OrbitConnectionContext = createContext<OrbitConnection>(null);

export const ConnectionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const connection = OrbitConnection.Instance;

  return (
    <OrbitConnectionContext.Provider value={connection}>
      {children}
    </OrbitConnectionContext.Provider>
  );
};

export const useOrbitConnection = (
  desktopPeerId?: string,
  recordingsAddrRoot?: string
): [OrbitConnection | null, boolean, Error | null] => {
  const connection = useContext(OrbitConnectionContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | Error>(null);

  if (connection === null) {
    throw new Error('`useConnection` must be inside a `ConnectionProvider`');
  }

  useEffect(() => {
    async function connect() {
      try {
        await connection.connect(desktopPeerId, recordingsAddrRoot);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError(new Error('Could not initialize database'));
        setLoading(false);
      }
    }
    connect();
  }, [connection]);

  return [connection, loading, error];
};
