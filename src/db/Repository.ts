/**
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
import type { IPFS } from 'ipfs-core-types';
import { Recording } from '@/common/Recording.interface';
import { AccountInfo } from '@/common/AccountInfo.interface';
import { RECORDING_COLLECTION } from '@/common/constants';
import OrbitConnection from '@/db/OrbitConnection';

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

type AccountInfoKey = keyof AccountInfo;

export type UserStore = Omit<
  KeyValueStore<AccountInfo>,
  'get' | 'put' | 'set' | 'all'
> & {
  get<T extends AccountInfoKey>(key: T): AccountInfo[T];
  put<T extends AccountInfoKey>(key: T, value: AccountInfo[T]): Promise<string>;
  set<T extends AccountInfoKey>(key: T, value: AccountInfo[T]): Promise<string>;
  all: AccountInfo;
  id: string;
};

export class OrbitRepository<T> implements BaseRepository<T> {
  public kvstore: KeyValueStore<AccountInfo>;
  public readonly node: IPFS;
  public readonly orbitdb: OrbitDB;

  constructor(
    private orbitConnection: typeof OrbitConnection.Instance,
    public readonly dbName: string,
    public readonly recordingsAddrRoot?: string
  ) {
    this.node = this.orbitConnection.node;
    this.orbitdb = this.orbitConnection.orbitdb;
  }

  async init(): Promise<UserStore> {
    this.kvstore = await this.orbitdb.kvstore(this.dbName);
    const peerInfo = await this.node.id();

    await this.kvstore.load();
    await this.kvstore.set('nodeId', peerInfo.id as unknown as AccountInfo);
    await this.kvstore.set(
      'dbAddress',
      this.kvstore.address as unknown as AccountInfo
    );

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

  private async getDb() {
    const db: DocumentStore<T> = await this.orbitdb.docs(
      this.recordingsAddrRoot
        ? '/orbitdb/' + this.recordingsAddrRoot
        : this.dbName,
      {
        accessController: {
          type: 'orbitdb',
          write: ['*'],
        },
      }
    );
    await db.load();
    return db;
  }

  async find(query: Partial<T>) {
    const db = await this.getDb();

    let results: T[] = [];

    const keys = Object.keys(query) as unknown as (keyof T)[];
    /*
     * If query is empty, return all documents
     */
    if (!keys.length) return db.get('');

    /*
     * Otherwise, collect and return query results
     */
    keys.forEach((key) => {
      results = [...results, ...db.query((doc: T) => doc[key] === query[key])];
    });

    return results;
  }

  async findById(_id: string): Promise<T> {
    const db = await this.getDb();

    const results = db.query((doc: T & { _id: string }) => doc._id === _id);
    console.log('findById, results', results);

    return results[0];
  }

  async add(doc: T): Promise<T> {
    const db: DocumentStore<T> = await this.orbitdb.docs(this.dbName);
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
    console.log('Repository, _id', _id);
    console.log('Repository, document', document);

    if (!document) throw new Error(`No document fount matching id ${_id}`);

    document = {
      ...document,
      ...update,
    };

    await db.put(document);
    return document;
  }

  async delete(_id: string): Promise<string> {
    const db: DocumentStore<T> = await this.orbitdb.docs(this.dbName);
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
