import React, { createContext, useContext, useEffect, useState } from 'react';
import { Loader } from '@/components/Loader';
import OrbitConnection from '@/db/OrbitConnection';
import { IpcService } from '@/IpcService';

export const OrbitConnectionContext = createContext<OrbitConnection>(null);

export const OrbitConnectionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const searchParams = new URLSearchParams(window.location.search);
  const desktopPeerId = searchParams.get('peerid');
  const recordingsAddrRoot = searchParams.get('address');
  const relayMultiaddressFromParam = searchParams.get('relay');
  const connection = new OrbitConnection();
  const [orbitdbConnection, setOrbitDbConnection] =
    useState<OrbitConnection>(connection);
  const [initialized, setInitialized] = useState(false);
  const ipc = new IpcService();

  useEffect(() => {
    async function connect() {
      let relayMultiAddress: string;

      if (relayMultiaddressFromParam) {
        relayMultiAddress = relayMultiaddressFromParam;
      } else {
        try {
          const { data, error } = await ipc.send<{
            data: string;
            error: Error;
          }>('relay:start');
          if (error) {
            throw error;
          }
          relayMultiAddress = data;
        } catch (error) {
          console.error('Could not get relay multiaddress:', error);
        }
      }

      try {
        await connection.connect(
          relayMultiAddress,
          desktopPeerId,
          recordingsAddrRoot
        );
      } catch (error) {
        console.error('Could not connect orbitdb:', error);
      }
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
    throw new Error(
      '`useOrbitConnection` must be inside a `ConnectionProvider`'
    );
  }

  return connection;
};
