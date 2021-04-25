// import { randomBytes } from 'crypto';
import Dexie from 'dexie';
import { Recording } from './common/Recording.interface';
import { RecordingFormats } from './common/RecordingFormats.enum';
import { Database, Remote } from '@textile/threaddb';
import { KeyInfo, PrivateKey, ThreadID, Users, Client } from '@textile/hub';

// export class AppDatabase extends Dexie {
//   recordings: Dexie.Table<Recording, string>;

//   constructor() {
//     super('TapesDatabase');

//     this.version(1).stores({
//       recordings: '++id, location, title, size, created',
//     });

//     this.recordings.mapToClass(RecordingModel);
//   }
// }

export class RecordingModel implements Recording {
  // id: string;
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
    // this.id = randomBytes(12).toString('hex');
    // this.id = Date.now().toString();
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

export class AppDatabase {
  _db: Database;
  _remote: Remote;

  constructor() {
    if (!this._db) {
      this._db = new Database(THREADS_DB_NAME, {
        name: 'Recording',
        schema: RecordingModel,
      });
    }
  }

  init = () => {
    console.log('Init DB');
    const open = async () => {
      console.log('Opening local database...', this._db.verno);
      await this._db.open(1);

      const dbThread = await getDbThread();
      await this.initRemote(dbThread);
    };
    open();
  };

  initRemote = async (dbThread: ThreadID) => {
    console.log('Initializing remote database...');
    this._remote = await this._db.remote.setKeyInfo(keyInfo);
    const identity = await getIdentity();
    console.log('*** identity:', identity);
    await this._remote.authorize(identity);
    console.log('*** remote:', this._remote);

    try {
      console.log('*** dbThread:', dbThread);
      this._remote.id = dbThread.toString();
      await this._remote.initialize();
    } catch (err) {
      console.error('Could not initialize remote database:', err);
    }
    console.log('Remote database initialized');

    const remoteInfo = await this._remote.info();
    console.log('*** remote info:', remoteInfo);
  };

  add = async (collectionName: string, doc: any) => {
    const collection = this._db.collection(collectionName);
    const result = await collection.insert(doc);
    const docId = result[0];
    await this._remote.push(collectionName);
    return docId;
  };

  find = async (collectionName: string, query: any = {}) => {
    // await this._remote.push(collectionName);
    // await this._remote.pull(collectionName);
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
    await this._remote.push(collectionName);
  };

  delete = async (collectionName: string, docId: string) => {
    const collection = this._db.collection(collectionName);
    await collection.delete(docId);
    await this._remote.push(collectionName);
  };
}

export const db = new AppDatabase();
