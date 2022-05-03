// import os from 'os'
//@ts-ignore
import OrbitDB from 'orbit-db';
import type { IPFS } from 'ipfs-core-types'
import { CID } from 'multiformats/cid'
import * as jsonEncoder from 'multiformats/codecs/json'
import { sha256 } from 'multiformats/hashes/sha2'
import { base64 } from "multiformats/bases/base64"
import { createIpfsNode } from './utils';
import { AppDatabase } from './AppDatabase.interface'
import DocumentStore from 'orbit-db-docstore';

// const Buffer = require('buffer/').Buffer;

const RECORDINGS_COLLECTION = 'recordings'

interface Collection {
  name: string
}

export class OrbitDatabase implements AppDatabase {
  private node: IPFS;
  private orbitdb: OrbitDB;
  private defaultOptions: any;
  private user: any;
  private companions: any;
  /** https://stackoverflow.com/a/50428377 */
  private peerConnectTimeout: ReturnType<typeof setTimeout>
  private docStores: { [key: string]: DocumentStore<unknown> } = {}

  async init() {
    this.node = await createIpfsNode()

    try {
      this.orbitdb = await OrbitDB.createInstance(this.node, {
        //@ts-ignore
        offline: process.env.NODE_ENV === 'test',
        id: process.env.NODE_ENV === 'test' ? 'test_' + Date.now() : undefined
      });
      // this.orbitdb = await new OrbitDB.default(this.node)
    } catch (err) {
      console.error('Could not create OrbitDB instance:', err)
      throw new Error('Could not create OrbitDB instance')
    }

    const peerInfo = await this.node.id();

    this.defaultOptions = {
      acessController: {
        write: [this.orbitdb.id],
      },
    };

    /**
     * Recordings document store
     */
    const docStoreOptions = {
      ...this.defaultOptions,
      indexBy: '_id',
    };

    const recordings = await this.orbitdb.docstore(RECORDINGS_COLLECTION, {
      ...docStoreOptions,
      // accessController: CustomAccessController,
    });
    this.docStores[RECORDINGS_COLLECTION] = recordings

    for (const docStore in this.docStores) {
      await this.docStores[docStore].load()
    }

    /**
     * Users key-value store
     */
    this.user = await this.orbitdb.keyvalue('user', this.defaultOptions);
    await this.user.load();

    await this.loadFixtureData({
      // deviceInfo: {
      //   hostname: os.hostname(),
      //   platform: os.platform()
      // },
      docStores: this.getDocStoreIds(),
      nodeId: peerInfo.id
    })

    /**
     * Peers key-value store
     */
    this.companions = await this.orbitdb.keyvalue(
      'companions',
      this.defaultOptions
    );
    await this.companions.load();

    /**
     * DEBUG INFO
     */
    console.log('*** peerInfo:', peerInfo);

    //@ts-ignore
    const identity = this.orbitdb.identity
    console.log('*** identity:', identity.toJSON())

    console.log('*** recordings address:', this.docStores['recordings'].address.toString())

    console.log('*** user:', this.user.all)
    /**
     * Listen for incoming connections
     */
    //@ts-ignore
    this.node.libp2p.connectionManager.on(
      'peer:connect',
      this.handlePeerConnected.bind(this)
    );

    await this.node.pubsub.subscribe(
      peerInfo.id,
      this.handleMessageReceived.bind(this)
    );

    // TODO: Handle companion connections
    // setTimeout(this.testConnect.bind(this), 2000)
    // const config = await this.node.config.getAll()
    // console.log('*** config:', config)

    this.testConnect()

    return this;
  }

  async testConnect() {
    const MOBILE_PEER = 'QmdBriFpsjqbgwHzPq3rY3n9zfer6rT8Z2s1qHobjtk4i7'
    const BROWSER_PEER = 'QmVV4j6te7hWGYPD85xeKVWzSWwxhA1c2zVauVeivE8DEs'
    const SIG_SERVER = '/dns4/cryptic-thicket-32566.herokuapp.com/tcp/443/wss/p2p-webrtc-star/p2p/'
    // const SIG_SERVER = '/ip4/127.0.0.1/tcp/0/ipfs/'
    try {
      console.log('*** Connecting to peer ', SIG_SERVER + MOBILE_PEER)
      await this.node.swarm.connect(SIG_SERVER + MOBILE_PEER)
      console.log('*** Connected to peer!')
    } catch (err) {
      console.error('*** Could not connect to peer:', err)
    }
  }

  /**
   * Event handlers
   */

  openpeerconnect = async (data: string) => { if ((await this.node.swarm.peers()).length <= 5) console.log('*** peer connected:', data) };
  ondbdiscovered = (data: any) => console.log('*** db discovered:', data);
  onmessage = (data: any) => console.log('*** message recieved:', data);

  private getDocStoreIds() {
    let docStoreIds = {}

    for (const docStore in this.docStores) {
      //@ts-ignore
      docStoreIds[docStore] = this.docStores[docStore].address
    }

    return docStoreIds
  }

  private async loadFixtureData(fixtureData: any) {
    const fixtureKeys = Object.keys(fixtureData)
    for (const i in fixtureKeys) {
      const key = fixtureKeys[i]
      // if (!this.user.get(key)) await this.user.set(key, fixtureData[key])
      await this.user.set(key, fixtureData[key])
    }
  }

  private handlePeerConnected(ipfsPeer: any) {
    // console.log('*** handlePeerConnected, ipfsPeer:', ipfsPeer)

    const ipfsId = ipfsPeer.remotePeer._idB58String;

    this.peerConnectTimeout = setTimeout(async () => {
      await this.sendMessage(ipfsId, { userDb: this.user.id });
    }, 2000);
    if (this.openpeerconnect) this.openpeerconnect(ipfsId);
  }

  private async handleMessageReceived(msg: any) {
    const parsedMsg = JSON.parse(msg.data.toString());
    console.log('*** handleMessageReceived:', parsedMsg);
    // const msgKeys = Object.keys(parsedMsg);

    // switch (msgKeys[0]) {
    //   case 'userDb':
    //     var peerDb = await this.orbitdb.open(parsedMsg.userDb);
    //     peerDb.events.on('replicated', async () => {
    //       if (peerDb.get('recordings')) {
    //         await this.companions.set(peerDb.id, peerDb.all);
    //         this.ondbdiscovered && this.ondbdiscovered(peerDb);
    //       }
    //     });
    //     break;
    //   default:
    //     break;
    // }

    // if (this.onmessage) this.onmessage(msg);
  }

  private async sendMessage(topic: string, message: any) {
    try {
      const msgString = JSON.stringify(message);
      const messageBuffer = Buffer.from(msgString);
      await this.node.pubsub.publish(topic, messageBuffer);
    } catch (err) {
      console.error('Couold not send message:', err);
      throw new Error('Could not send message');
    }
  }


  /**
   * Public DB methods
   */
  async add(collectionName: string, doc: any): Promise<string> {
    const bytes = jsonEncoder.encode(doc)
    const hash = await sha256.digest(bytes)
    const cid = CID.create(1, jsonEncoder.code, hash)
    const docId = cid.toString(base64.encoder)
    // const docId = 'bajs'

    await this.docStores[collectionName].put({ ...doc, _id: docId })
    return docId
  }

  async find(collectionName: string, query: any = {}): Promise<any[]> {
    let results: any[] = []

    const keys = Object.keys(query);

    /**
     * If query is empty, return all recordings
     */
    if (!keys.length) {
      return this.docStores[collectionName].get('')
    }

    /**
     * Otherwise, collect and return query results
     */
    keys.forEach((key) => {
      results = [
        ...results,
        ...this.docStores[collectionName].query((doc: any) => doc[key] === query[key])
      ]
    });

    return results
  }

  async findById(collectionName: string, docId: string): Promise<any> {
    return this.docStores[collectionName].query((doc: any) => doc._id === docId)[0]
  }

  async update(collectionName: string, docId: string, update: any): Promise<any> {
    let document = await this.findById(collectionName, docId)

    document = {
      ...document,
      ...update
    }

    await this.docStores[collectionName].put(document)
    return document
  }

  async delete(collectionName: string, docId: string): Promise<string> {
    await this.docStores[collectionName].del(docId)

    return docId
  }

  async deleteDB() {
    return new Promise((resolve, _reject) => {
      resolve('done')
    })
  }


  /**
   * Close database connection
   */
  async close() {
    console.log('Closing database connections...')
    const peerInfo = await this.node.id()
    try {
      // console.log('### IPFS stats:', this.node.stats)
      clearTimeout(this.peerConnectTimeout)
      await this.node.pubsub.unsubscribe(peerInfo.id, this.handleMessageReceived)
      await this.node.stop()
      // await this.orbitdb.disconnect()
    } catch (err) {
      console.error('Could not close database connections:', err)
    }
    console.log('Database connections closed')
  }
}

// let OrbitDB: any
// if (typeof window !== 'undefined') {
//   console.log('*** Creating OrbitDB instance in browser...')
//   OrbitDB = window.OrbitDB
//   console.log('OrbitDB:', OrbitDB)
// } else {
//   console.log('*** Creating OrbitDB instance in node...')
//   OrbitDB = require('orbit-db')
//   console.log('OrbitDB:', OrbitDB)
// }

export const db = new OrbitDatabase();