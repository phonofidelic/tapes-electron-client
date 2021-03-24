import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactElement,
} from 'react';
import {
  Buckets,
  PushPathResult,
  KeyInfo,
  PrivateKey,
  WithKeyInfoOptions,
} from '@textile/hub';

interface TextileProviderProps {
  children: ReactElement;
}

const TextileContext = createContext(null);

function TextileProvider({ children }: TextileProviderProps) {
  const [identity, setIdentity] = useState(null);
  /**
   * getIdentity uses a basic private key identity.
   * The user's identity will be cached client side. This is long
   * but ephemeral storage not sufficient for production apps.
   *
   * Read more here:
   * https://docs.textile.io/tutorials/hub/libp2p-identities/
   */
  const getIdentity = async (): Promise<PrivateKey> => {
    try {
      var storedIdent = localStorage.getItem('identity');
      if (storedIdent === null) {
        throw new Error('No identity');
      }
      const restored = PrivateKey.fromString(storedIdent);
      console.log('Stored identity:', restored);
      setIdentity(restored);
      return restored;
    } catch (e) {
      /**
       * If any error, create a new identity.
       */
      try {
        const identity = PrivateKey.fromRandom();
        const identityString = identity.toString();
        localStorage.setItem('identity', identityString);

        console.log('New identity:', identity);
        setIdentity(identity);
        return identity;
      } catch (err) {
        return err.message;
      }
    }
  };

  useEffect(() => {
    getIdentity();
  }, []);

  return (
    <TextileContext.Provider value={{ identity, getIdentity }}>
      {children}
    </TextileContext.Provider>
  );
}

const useTextile = () => useContext(TextileContext);

export { TextileProvider, useTextile };
