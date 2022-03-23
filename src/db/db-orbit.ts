//@ts-ignore
import OrbitDB from 'orbit-db';
import type { IPFS } from 'ipfs-core-types'
import { createIpfsNode } from './utils';
import { AppDatabase } from './AppDatabase'
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
  private recordings: any;
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
    // await this.recordings.load();
    // console.log('*** dockStores:', this.docStores)
    // await this.docStores[RECORDINGS_COLLECTION].put({ _id: '456', title: 'test2' })
    console.log('*** stored recordings:', this.docStores[RECORDINGS_COLLECTION].get(''))
    console.log('*** found recording:', await this.find(RECORDINGS_COLLECTION, { title: 'test2' }))

    /**
     * Users key-value store
     */
    this.user = await this.orbitdb.keyvalue('user', this.defaultOptions);
    await this.user.load();

    /**
     * Peers key-value store
     */
    this.companions = await this.orbitdb.keyvalue(
      'companions',
      this.defaultOptions
    );
    await this.companions.load();

    const peerInfo = await this.node.id();
    console.log('*** peerInfo:', peerInfo);

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

    return this;
  }

  openpeerconnect = console.log;
  ondbdiscovered = console.log;
  onmessage = console.log;

  handlePeerConnected(ipfsPeer: any) {
    const ipfsId = ipfsPeer.remotePeer._idB58String;
    // console.log('*** handlePeerConnected, ipfsId:', ipfsId)
    this.peerConnectTimeout = setTimeout(async () => {
      await this.sendMessage(ipfsId, { userDb: this.user.id });
    }, 2000);
    if (this.openpeerconnect) this.openpeerconnect(ipfsId);
  }

  async handleMessageReceived(msg: any) {
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

  async sendMessage(topic: string, message: any) {
    try {
      const msgString = JSON.stringify(message);
      const messageBuffer = Buffer.from(msgString);
      await this.node.pubsub.publish(topic, messageBuffer);
    } catch (err) {
      console.error('Couold not send message:', err);
      throw new Error('Could not send message');
    }
  }

  // TODO: implement old methotds
  async initRemote(): Promise<any> {
    return new Promise((resolve, _reject) => {
      resolve('done')
    })
  }

  async push(_collectionName: string): Promise<any> {
    return new Promise((resolve, _reject) => {
      resolve('done')
    })
  }

  async pull(_collectionName: string): Promise<any> {
    return new Promise((resolve, _reject) => {
      resolve('done')
    })
  }

  /**
   * TODO: Implement public methods
   */
  async add(collectionName: string, doc: any): Promise<string> {
    return await this.docStores[collectionName].put(doc)
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

  async findById(_collectionName: string, _id: string): Promise<any> {
    return new Promise((resolve, _reject) => {
      resolve('done')
    })
  }

  async update(_collectionName: string, _docId: string, _update: any): Promise<any> {
    return new Promise((resolve, _reject) => {
      resolve('done')
    })
  }

  async delete(_collectionName: string, _docId: string): Promise<any> {
    return new Promise((resolve, _reject) => {
      resolve('done')
    })
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
      console.error('Could not close database connectinos:', err)
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