import {
  THREADS_DB_NAME,
  IDENTITY_STORE,
  RECORDING_COLLECTION,
} from '../common/constants';
import { Database, Remote } from '@textile/threaddb';
import { KeyInfo, PrivateKey, ThreadID, Users, Client } from '@textile/hub';

const getIdentity = async (): Promise<PrivateKey> => {
  try {
    var storedIdent = localStorage.getItem(IDENTITY_STORE);
    if (!storedIdent) {
      throw new Error('No stored identity');
    }
    const restored = PrivateKey.fromString(storedIdent);
    console.log('Stored identity found');
    return restored;
  } catch (err) {
    console.error('Could not retrieve stored identity:', err);
    /**
     * If any error, create a new identity.
     */
    try {
      const identity = PrivateKey.fromRandom();
      const identityString = identity.toString();
      localStorage.setItem(IDENTITY_STORE, identityString);

      console.log('New identity created');
      return identity;
    } catch (err) {
      return err.message;
    }
  }
};

const getDbThread = async () => {
  let dbThread: ThreadID;
  try {
    const storedIdent = localStorage.getItem(IDENTITY_STORE);
    const identity = PrivateKey.fromString(storedIdent);

    const user = await Users.withKeyInfo(keyInfo);
    await user.getToken(identity);

    const threads = await user.listThreads();
    console.log('*** threads:', threads);
    if (!threads.length) {
      dbThread = undefined;
    } else {
      console.log('Existing Threads found, retreiving ThreadID...');
      const getThreadResponse = await user.getThread(THREADS_DB_NAME);
      console.log('getThreadResponse:', getThreadResponse);

      dbThread = ThreadID.fromString(getThreadResponse.id);
    }
  } catch (err) {
    console.error('getDbThread error:', err);
    switch (err.code) {
      case 5:
        console.log('Thread not found');
        dbThread = undefined;
        break;

      default:
        throw err;
    }
  }
  return dbThread;
};

declare const USER_API_KEY: any;
const keyInfo: KeyInfo = {
  key: USER_API_KEY,
};

/**
 * TODO: Create abstract to implement AppDatabase
 */
export class AppDatabase {
  _db: Database;
  _remote: Remote;

  constructor() {
    if (!this._db) {
      this._db = new Database(THREADS_DB_NAME, {
        name: 'Recording',
        // schema: RecordingModel,
        //@ts-ignore
        // schema: RecordingSchema,
      });
    }
  }

  init = async () => {
    console.log('Init DB');
    console.log('Opening local database...', this._db.verno);
    try {
      await this._db.open(1);
    } catch (err) {
      console.error('Could not open DB:', err);
    }

    console.log('*** DB:', this._db);

    await this.initRemote();

    // const connector = new WalletConnect({
    //   bridge: 'https://bridge.walletconnect.org', // Required
    //   qrcodeModal: QRCodeModal,
    // });
    // console.log('*** connector:', connector);

    // // Check if connection is already established
    // if (!connector.connected) {
    //   // create new session
    //   connector.createSession();
    // }

    // // Subscribe to connection events
    // connector.on('connect', (error, payload) => {
    //   if (error) {
    //     throw error;
    //   }

    //   // Get provided accounts and chainId
    //   const { accounts, chainId } = payload.params[0];
    // });

    // connector.on('session_update', (error, payload) => {
    //   if (error) {
    //     throw error;
    //   }

    //   // Get updated accounts and chainId
    //   const { accounts, chainId } = payload.params[0];
    // });

    // connector.on('disconnect', (error, payload) => {
    //   if (error) {
    //     throw error;
    //   }

    //   // Delete connector
    // });

    // console.log('*** Launching Metamask?');
    // //@ts-ignore
    // await window.ethereum.enable();

    // console.log('*** Connecting to testnet...');
    // const opt: ConnectionOptions = {
    //   network: 'testnet',
    //   host: 'https://testnet.tableland.network',
    // };
    // const tbl = await connect(opt);
    // console.log('*** tbl:', tbl.list());
  };

  initRemote = async () => {
    console.log('Initializing remote database...');
    try {
      const identity = await getIdentity();
      const dbThread = await getDbThread();

      console.log('*** keyInfo:', keyInfo);
      this._remote = await this._db.remote.setKeyInfo(keyInfo);
      await this._remote.authorize(identity);
      this._remote.set({ debug: true });

      // console.log('*** dbThread:', dbThread);
      // if (dbThread) {
      //   this._db.remote.id = dbThread.toString();
      // }
      // await this._remote.initialize();

      console.log('*** remote before init:', this._remote);
      console.log('*** remote info:', this._remote.get());

      const storedId = localStorage.getItem('remote-db-id') || undefined;
      console.log('*** storedId:', storedId);
      if (!storedId) {
        const newId = await this._remote.initialize();
        localStorage.setItem('remote-db-id', newId);
      } else {
        await this._remote.initialize(storedId);
      }

      console.log('*** remote after init:', this._remote);
    } catch (err) {
      console.error('Could not initialize remote database:', err);
      throw new Error('Could not initialize remote database');
    }
    console.log('Remote database initialized');
  };

  push = async (collectionName: string) => {
    console.log('Pushing local changes to remote DB...');

    // TODO: Implement stash process
    try {
      await this._remote.push(collectionName);
    } catch (err) {
      console.error('Could not push changes to remote DB:', err);
      throw err;
    }
    console.log('Remote DB synced');
  };

  pull = async (collectionName: string) => {
    console.log('Pulling data from remote DB...');

    // TODO: Implement stash process
    try {
      await this._remote.pull(collectionName);
    } catch (err) {
      console.error('Could not pull changes from remote DB:', err);
      throw err;
    }
    console.log('Local DB synced');
  };

  add = async (collectionName: string, doc: any) => {
    const collection = this._db.collection(collectionName);

    let result;
    try {
      result = await collection.insert(doc);
    } catch (err) {
      console.error('Could not insert document in collection:', err);
    }

    const docId = result[0];
    return docId;
  };

  find = async (collectionName: string, query: any = {}) => {
    let collection;
    try {
      collection = this._db.collection(collectionName);
    } catch (err) {
      console.error('Could not find collection:', err);
    }

    const result = await collection.find(query).toArray();
    return result;
  };

  findById = async (collectionName: string, id: string) => {
    const collection = this._db.collection(collectionName);
    const result = await collection.findById(id);
    console.log('findById, result:', result);
    return result;
  };

  update = async (collectionName: string, docId: string, update: any) => {
    const collection = this._db.collection(collectionName);
    let doc = await collection.findById(docId);
    doc = {
      ...doc,
      ...update,
    };
    await collection.save(doc);
  };

  delete = async (collectionName: string, docId: string) => {
    const collection = this._db.collection(collectionName);
    await collection.delete(docId);
  };

  deleteDB = async () => {
    await this._db.delete();
  };
}

export const db = new AppDatabase();