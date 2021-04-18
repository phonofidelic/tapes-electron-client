import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactElement,
} from 'react';
import {
  Buckets,
  Client,
  Users,
  PushPathResult,
  KeyInfo,
  PrivateKey,
  WithKeyInfoOptions,
  ThreadID,
  GetThreadResponse,
} from '@textile/hub';
import { Recording } from '../common/Recording.interface';
import { RecordingFormats } from '../common/RecordingFormats.enum';

const THREADS_DB_NAME = 'tapes-thread-db';

declare const USER_API_KEY: any;

interface TextileProviderProps {
  children: ReactElement;
}

const TextileContext = createContext(null);

function TextileProvider({ children }: TextileProviderProps) {
  const [identity, setIdentity] = useState(null);
  const [bucketToken, setBucketToken] = useState('');

  const keyInfo: KeyInfo = {
    key: USER_API_KEY,
  };

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

  const initUserThread = async () => {
    const identity = await getIdentity();
    console.log('initUserThread, identity:', identity);

    /**
     * Initialize Textile User
     */
    const user = await Users.withKeyInfo(keyInfo);
    await user.getToken(identity);

    /**
     * Initialize Threads client
     */
    const client = await Client.withKeyInfo(keyInfo);
    await client.getToken(identity);

    /**
     * Attempt to find existing DB thread
     */
    let dbThread: ThreadID;
    try {
      let getThreadResponse = await user.getThread(THREADS_DB_NAME);
      dbThread = ThreadID.fromString(getThreadResponse.id);
      console.log('Remote Thread DB store found');
    } catch (err) {
      if (err.code === 5) {
        console.log('Could not find DB Thread:', err);

        /**
         * Create new DB Thread
         */
        console.log('Creating new store on remote node...');
        dbThread = await client.newDB(undefined, THREADS_DB_NAME);
      } else {
        throw err;
      }
    }
    console.log('initUserThread, dbThread:', dbThread);

    /**
     * Set up collections
     */
    const collections = await client.listCollections(dbThread);
    console.log('initUserThread, collections:', collections);

    if (
      !collections
        .map((collectinoInfo) => collectinoInfo.name)
        .includes('recordings')
    ) {
      console.log('No recordings collection found');
      /**
       * Initialize recordings collection
       */
      console.log('Creating new recordings collection...');
      const recordingShema: Recording = {
        _id: '',
        location: '',
        filename: '',
        size: 0,
        format: '' as RecordingFormats,
        channels: 1,
      };
      await client.newCollectionFromObject(dbThread, recordingShema, {
        name: 'recordings',
      });
    }

    const collectionInfo = await client.getCollectionInfo(
      dbThread,
      'recordings'
    );
    console.log('initUserThread, collectionInfo:', collectionInfo);

    const recordings = await client.find(dbThread, 'recordings', {});
    console.log('initUserThread, recordings:', recordings);

    /**
     * Clear all recording docs
     */
    // const recIds = recordings.map((rec: Recording) => rec._id);
    // await client.delete(dbThread, 'recordings', recIds);
    // const recordingsAfterDelete = await client.find(dbThread, 'recordings', {});
    // console.log(
    //   'initUserThread, recordingsAfterDelete:',
    //   recordingsAfterDelete
    // );
  };

  const getBucketToken = async () => {
    /**
     * Initialize Buckets and set token
     */
    const buckets = await Buckets.withKeyInfo(keyInfo, { debug: true });
    const token = await buckets.getToken(identity);
    return token;
  };

  useEffect(() => {
    initUserThread();
  }, []);

  return (
    <TextileContext.Provider value={{ identity, getIdentity, getBucketToken }}>
      {children}
    </TextileContext.Provider>
  );
}

const useTextile = () => useContext(TextileContext);

export { TextileProvider, useTextile };
