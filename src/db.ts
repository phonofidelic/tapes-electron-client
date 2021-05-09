import { Recording } from './common/Recording.interface';
import { RecordingFormats } from './common/RecordingFormats.enum';
import { Database } from '@textile/threaddb';
import { KeyInfo, PrivateKey, ThreadID, Users } from '@textile/hub';

export class RecordingModel implements Recording {
  location: string;
  remoteLocation?: string;
  bucketPath?: string;
  title: string;
  filename: string;
  size: number;
  duration: number;
  created: Date;
  format: RecordingFormats;
  channels: number;

  constructor(
    location: string,
    filename: string,
    title: string,
    size: number,
    format: RecordingFormats,
    channels: number,
    duration: number,
    remoteLocation?: string,
    bucketPath?: string
  ) {
    this.filename = filename;
    this.created = new Date();
    this.location = location;
    this.remoteLocation = remoteLocation || '';
    this.bucketPath = bucketPath || '';
    this.title = title;
    this.size = size;
    this.duration = duration;
    this.format = format;
    this.channels = channels;
  }
}

const THREADS_DB_NAME = 'tapes-thread-db';

const getIdentity = async (): Promise<PrivateKey> => {
  try {
    var storedIdent = localStorage.getItem('identity');
    if (storedIdent === null) {
      throw new Error('No identity');
    }
    const restored = PrivateKey.fromString(storedIdent);
    console.log('Stored identity:', restored);
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
      return identity;
    } catch (err) {
      return err.message;
    }
  }
};

const getDbThread = async () => {
  const storedIdent = localStorage.getItem('identity');
  const identity = PrivateKey.fromString(storedIdent);

  const user = await Users.withKeyInfo(keyInfo);
  await user.getToken(identity);

  const getThreadResponse = await user.getThread(THREADS_DB_NAME);
  const dbThread = ThreadID.fromString(getThreadResponse.id);

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

  constructor() {
    if (!this._db) {
      this._db = new Database(THREADS_DB_NAME, {
        name: 'Recording',
        schema: RecordingModel,
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

    await this.initRemote();
  };

  initRemote = async () => {
    console.log('Initializing remote database...');
    const dbThread = await getDbThread();

    await this._db.remote.setKeyInfo(keyInfo);
    const identity = await getIdentity();
    await this._db.remote.authorize(identity);

    try {
      this._db.remote.id = dbThread.toString();
      await this._db.remote.initialize();
    } catch (err) {
      console.error('Could not initialize remote database:', err);
    }
    console.log('Remote database initialized');
  };

  push = async (collectionName: string) => {
    console.log('Pushing local changes to remote DB...');
    try {
      await this._db.remote.push(collectionName);
    } catch (err) {
      console.error('Could not push changes to remote DB:', err);
    }
    console.log('Remote DB synced');
  };

  pull = async (collectionName: string) => {
    console.log('Pulling data from remote DB...');
    try {
      await this._db.remote.pull(collectionName);
    } catch (err) {
      console.error('Could not pull changes from remote DB:', err);
    }
    console.log('Local DB synced');
  };

  add = async (collectionName: string, doc: any) => {
    const collection = this._db.collection(collectionName);
    const result = await collection.insert(doc);
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
}

export const db = new AppDatabase();
