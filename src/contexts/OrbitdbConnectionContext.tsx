import OrbitConnection from '@/db/OrbitConnection';
import { setLoadingMessage } from '@/store/actions';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export const OrbitConnectionContext = createContext<OrbitConnection>(null);

export const OrbitConnectionProvider = ({
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
  const dispatch = useDispatch();

  if (connection === null) {
    throw new Error('`useConnection` must be inside a `ConnectionProvider`');
  }

  useEffect(() => {
    async function connect() {
      dispatch(setLoadingMessage('Initializing database...'));
      try {
        await connection.connect(desktopPeerId, recordingsAddrRoot);
        setLoading(false);
        dispatch(setLoadingMessage(null));
      } catch (error) {
        console.error(error);
        setError(new Error('Could not initialize database'));
        setLoading(false);
        dispatch(setLoadingMessage(null));
      }
    }
    connect();
  }, [connection]);

  return [connection, loading, error];
};
