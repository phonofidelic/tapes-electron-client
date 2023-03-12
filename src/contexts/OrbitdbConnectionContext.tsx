import React, { createContext, useContext, useEffect, useState } from 'react';
import { Loader } from '@/components/Loader';
import OrbitConnection from '@/db/OrbitConnection';

export const OrbitConnectionContext = createContext<OrbitConnection>(null);

export const OrbitConnectionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const searchParams = new URLSearchParams(window.location.search);
  const desktopPeerId = searchParams.get('peerid');
  const recordingsAddrRoot = searchParams.get('address');
  const connection = new OrbitConnection();
  const [orbitdbConnection, setOrbitDbConnection] =
    useState<OrbitConnection>(connection);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function connect() {
      await connection.connect(desktopPeerId, recordingsAddrRoot);
      setOrbitDbConnection(orbitdbConnection);
      setInitialized(true);
    }
    connect();
  }, []);

  if (!initialized) {
    return <Loader loading={true} loadingMessage="Initializing database" />;
  }

  return (
    <OrbitConnectionContext.Provider value={orbitdbConnection}>
      {children}
    </OrbitConnectionContext.Provider>
  );
};

export const useOrbitConnection = (): OrbitConnection => {
  const connection = useContext(OrbitConnectionContext);

  if (connection === null) {
    throw new Error('`useConnection` must be inside a `ConnectionProvider`');
  }

  return connection;
};
