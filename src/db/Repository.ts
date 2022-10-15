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

import { Recording } from '../common/Recording.interface';
import KeyValueStore from 'orbit-db-kvstore';
import { User } from '../common/User.interface';
//@ts-ignore
import { PeerInfo } from 'ipfs';
import type { IPFS } from 'ipfs-core-types';
import { Companion } from '../common/Companion.interface';
import { AccountInfo } from '../common/AccountInfo.interface';
import { RECORDING_COLLECTION } from '../common/constants';

interface Reader<T> {
  find(query: Partial<T>): Promise<T[]>;
  findById(_id: string): Promise<T>;
}

interface Writer<T> {
  add(doc: T): Promise<T>;
  update(_id: string, update: Partial<T>): Promise<T>;
  delete(_id: string): Promise<string>;
}

interface KVReader<T> {
  get(key: string): Promise<T>;
  all: T;
}

interface KVWriter<T> {
  set(key: string, value: T): Promise<void>;
}

type BaseRepository<T> = Reader<T> & Writer<T>;

type BaseKVRepository<T> = KVReader<T> & KVWriter<T>;

export abstract class OrbitRepository<T> implements BaseRepository<T> {
  constructor(
    public readonly node: IPFS,
    public readonly orbitdb: OrbitDB,
    public readonly dbName: string,
    public readonly recordingsAddrRoot?: string
  ) {}

  async find(query: any) {
    console.log('find, recordingsAddrRoot', this.recordingsAddrRoot);

    const db: DocumentStore<T> = await this.orbitdb.docs(
      // this.dbName
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

    let results: T[] = [];

    const keys = Object.keys(query);
    /**
     * If query is empty, return all documents
     */
    if (!keys.length) return db.get('');

    /**
     * Otherwise, collect and return query results
     */
    keys.forEach((key) => {
      results = [
        ...results,
        ...db.query((doc: any) => doc[key] === query[key]),
      ];
    });

    console.log('*** find recordings results:', results);

    return results;
  }

  async findById(_id: string): Promise<T> {
    const db: DocumentStore<T> = await this.orbitdb.docs(this.dbName);
    await db.load();

    return db.query((doc: any) => doc._id === _id)[0];
  }

  async add(doc: T): Promise<T> {
    const db: DocumentStore<T> = await this.orbitdb.docs(this.dbName);
    await db.load();

    const bytes = jsonEncoder.encode(doc);
    const hash = await sha256.digest(bytes);
    const cid = CID.create(1, jsonEncoder.code, hash);
    const docId = cid.toString(base64.encoder);

    await db.put({ ...doc, _id: docId });
    return await db.query((doc: any) => doc._id === docId)[0];
  }

  async update(_id: string, update: Partial<T>): Promise<T> {
    const db: DocumentStore<T> = await this.orbitdb.docs(this.dbName);
    await db.load();

    let document = await this.findById(_id);

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
}

export abstract class OrbitKVRepository<T> implements BaseKVRepository<T> {
  public db: KeyValueStore<T>;

  abstract setup(): Promise<void>;

  constructor(
    public readonly node: IPFS,
    public readonly orbitdb: OrbitDB,
    public readonly dbName: string
  ) {}

  async init() {
    this.db = await this.orbitdb.keyvalue(this.dbName);
    await this.db.load();
    await this.setup();

    return this;
  }

  async get(key: string) {
    const db: KeyValueStore<T> = await this.orbitdb.keyvalue(this.dbName);
    await db.load();

    return db.get(key);
  }

  get all() {
    // const db: KeyValueStore<T> = await this.orbitdb.keyvalue(this.dbName);
    // await db.load();

    return this.db.all as unknown as T;
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
    console.log('*** getAddress, address:', address);

    return address;
  }
}

export class UserRepository extends OrbitKVRepository<AccountInfo> {
  async setup(): Promise<void> {
    const peerInfo = await this.node.id();
    console.log('*** peerInfo:', peerInfo);
    await this.db.set('nodeId', peerInfo.id as unknown as AccountInfo);
    await this.db.set('dbAddress', this.db.address as unknown as AccountInfo);
    await this.db.set('deviceName', this.getDeviceName());
  }

  private getDeviceName() {
    let deviceName = this.db.get('deviceName');
    //@ts-ignore
    if (!deviceName) deviceName = generateUsername('-');
    return deviceName;
  }
}
