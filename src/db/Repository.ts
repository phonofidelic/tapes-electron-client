/*
 * https://dev.to/fyapy/repository-pattern-with-typescript-and-nodejs-25da
 */
import OrbitDB from 'orbit-db';
import DocumentStore from 'orbit-db-docstore';
import { CID } from 'multiformats/cid';
import * as jsonEncoder from 'multiformats/codecs/json';
import { sha256 } from 'multiformats/hashes/sha2';
import { base64 } from 'multiformats/bases/base64';
import { generateUsername } from 'unique-username-generator';
import KeyValueStore from 'orbit-db-kvstore';
import { Recording } from '@/common/Recording.interface';
import { AccountInfo } from '@/common/AccountInfo.interface';
import { RECORDING_COLLECTION } from '@/common/constants';
import OrbitConnection from '@/db/OrbitConnection';
import { IpfsWithLibp2p } from './utils';
import { Companion } from '@/common/Companion.interface';

interface DocumentReader<T> {
  find(query: Partial<T>): Promise<T[]>;
  findById(_id: string): Promise<T>;
}

interface DocumentWriter<T> {
  add(doc: T): Promise<T>;
  update(_id: string, update: Partial<T>): Promise<T>;
  delete(_id: string): Promise<string>;
}

interface KeyValueReader<T> {
  get(key: string): Promise<T>;
  all(): Promise<T>;
}

interface KeyValueWriter<T> {
  set(key: string, value: T): Promise<void>;
}

type BaseRepository<T> = DocumentReader<T> &
  DocumentWriter<T> &
  KeyValueReader<T> &
  KeyValueWriter<T>;

export type CustomKeyValueStore<K> = Omit<
  KeyValueStore<K>,
  'get' | 'put' | 'set' | 'all'
> & {
  get<T extends keyof K>(key: T): K[T];
  put<T extends keyof K>(key: T, value: K[T]): Promise<string>;
  set<T extends keyof K>(key: T, value: K[T]): Promise<string>;
  all: K;
  id: string;
};

export type UserStore = CustomKeyValueStore<AccountInfo>;

export type CompanionStore = CustomKeyValueStore<Record<string, Companion>>;

type OrbitRepositoryEventType = 'replicated';
class OrbitRepositoryEventTarget extends EventTarget {
  public addEventListener(
    type: OrbitRepositoryEventType,
    callback: EventListenerOrEventListenerObject
  ): void {
    super.addEventListener(type, callback);
  }

  public removeEventListener(
    type: OrbitRepositoryEventType,
    callback: EventListenerOrEventListenerObject
  ): void {
    super.removeEventListener(type, callback);
  }

  public dispatchEvent(event: Event): boolean {
    return super.dispatchEvent(event);
  }
}

export class OrbitRepository<T>
  extends OrbitRepositoryEventTarget
  implements BaseRepository<T>
{
  public kvstore: KeyValueStore<unknown>;
  public readonly node: IpfsWithLibp2p;
  public readonly orbitdb: OrbitDB;

  constructor(
    private orbitConnection: typeof OrbitConnection.Instance,
    public readonly dbName: 'Recording' | 'user' | 'companions',
    public readonly recordingsAddrRoot?: string
  ) {
    super();
    this.node = this.orbitConnection.node;
    this.orbitdb = this.orbitConnection.orbitdb;
  }

  async init(dbName: 'user'): Promise<UserStore>;
  async init(dbName: 'companion'): Promise<CompanionStore>;
  async init() {
    try {
      this.kvstore = await this.orbitdb.kvstore(this.dbName, {
        accessController: {
          type: 'orbitdb',
          write: ['*'],
        },
      });
    } catch (error) {
      console.error('Could not create database:', error);
    }

    await this.kvstore.load();

    if (this.dbName === 'user') {
      const nodeId = this.node.libp2p.peerId.toString();
      await this.kvstore.set('nodeId', nodeId as unknown as AccountInfo);
      await this.kvstore.set('dbAddress', this.kvstore.address);

      this.recordingsAddrRoot &&
        (await this.kvstore.set(
          'recordingsAddrRoot',
          this.recordingsAddrRoot as unknown as AccountInfo
        ));

      let deviceName = this.kvstore.get('deviceName');
      if (!deviceName) {
        deviceName = generateUsername('-') as unknown as AccountInfo;
      }

      await this.kvstore.set('deviceName', deviceName);

      return this.kvstore as unknown as UserStore;
    }

    if (this.dbName === 'companions') {
      return this.kvstore as unknown as CompanionStore;
    }
  }

  private async getDb() {
    try {
      const db: DocumentStore<T> = await this.orbitdb.docs(
        this.orbitConnection.recordingsAddrRoot
          ? '/orbitdb/' + this.orbitConnection.recordingsAddrRoot
          : this.dbName,
        {
          accessController: {
            type: 'orbitdb',
            write: ['*'],
          },
        }
      );

      db.events.on('replicated', () => {
        const event = new CustomEvent('replicated');
        this.dispatchEvent(event);
      });

      await db.load();

      return db;
    } catch (error) {
      console.error('Could not get db:', error);
    }
  }

  async find(query: Partial<T>) {
    let results: T[] = [];

    try {
      const db = await this.getDb();

      const keys = Object.keys(query) as unknown as (keyof T)[];
      /*
       * If query is empty, return all documents
       */
      if (!keys.length) return db.get('');

      /*
       * Otherwise, collect and return query results
       */
      keys.forEach((key) => {
        results = [
          ...results,
          ...db.query((doc: T) => doc[key] === query[key]),
        ];
      });
    } catch (error) {
      console.error(error);
      throw new Error('Could not perform `find` operation');
    }

    return results;
  }

  async findById(_id: string): Promise<T> {
    const db = await this.getDb();

    const results = db.query((doc: T & { _id: string }) => doc._id === _id);

    return results[0];
  }

  async add(doc: T): Promise<T> {
    const db = await this.getDb();
    await db.load();

    const bytes = jsonEncoder.encode(doc);
    const hash = await sha256.digest(bytes);
    const cid = CID.create(1, jsonEncoder.code, hash);
    const docId = cid.toString(base64.encoder);

    await db.put({ ...doc, _id: docId });
    return await db.query((doc: T & { _id: string }) => doc._id === docId)[0];
  }

  async update(_id: string, update: Partial<T>): Promise<T> {
    const db = await this.getDb();

    let document = await this.findById(_id);

    if (!document) throw new Error(`No document fount matching id ${_id}`);

    document = {
      ...document,
      ...update,
    };

    await db.put(document);
    return document;
  }

  async delete(_id: string): Promise<string> {
    const db = await this.getDb();

    await db.load();

    await db.del(_id);

    return _id;
  }

  async get(key: string) {
    const db: KeyValueStore<T> = await this.orbitdb.keyvalue(this.dbName);
    await db.load();

    return db.get(key);
  }

  async all() {
    const db: KeyValueStore<T> = await this.orbitdb.keyvalue(this.dbName);
    await db.load();

    return db.all as unknown as T;
  }

  async set(key: string, value: T) {
    const db: KeyValueStore<T> = await this.orbitdb.keyvalue(this.dbName);
    await db.set(key as string, value);
  }
}

export class RecordingRepository extends OrbitRepository<Recording> {
  async getAddress() {
    const address = await this.orbitdb.determineAddress(
      RECORDING_COLLECTION,
      'docstore'
    );

    return address as unknown as { root: string; path: string };
  }
}

export class UserRepository extends OrbitRepository<AccountInfo> {}
export class CompanionRepository extends OrbitRepository<Companion> {}
