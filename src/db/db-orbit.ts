//@ts-ignore
import OrbitDB from 'orbit-db';
import type { IPFS } from 'ipfs-core-types'
import { create } from 'ipfs-http-client'
import { createIpfsNode } from './utils';
import { ThreeSixty } from '@mui/icons-material';

// const Buffer = require('buffer/').Buffer;

export class AppDatabase {
  node: IPFS;
  OrbitDB: any;
  orbitdb: any;
  defaultOptions: any;
  recordings: any;
  user: any;
  companions: any;
  test: string

  constructor(OrbitDB: any) {
    this.OrbitDB = OrbitDB
    this.test = 'hello!'
  }

  async init() {
    this.node = await createIpfsNode()
    // this.node = create({
    //   url: 'http://0.0.0.0:5001',
    //   host: 'localhost',
    //   protocol: 'tcp'
    // })
    //@ts-ignore
    console.log('*** db init, this.node:', this.node)
    console.log('*** db init, OrbitDB:', OrbitDB)
    try {
      this.orbitdb = await OrbitDB.createInstance(this.node);
      // this.orbitdb = await new OrbitDB.default(this.node)
    } catch (err) {
      console.error('Could not create OrbitDB instance:', err)
      throw new Error('Could not create OrbitDB instance')
    }

    this.defaultOptions = {
      acessController: {
        write: [this.orbitdb.identity.id],
      },
    };

    /**
     * Recordings document store
     */
    const docStoreOptions = {
      ...this.defaultOptions,
      indexBy: 'hash',
    };

    this.recordings = await this.orbitdb.docstore('recordings', {
      ...docStoreOptions,
      // accessController: CustomAccessController,
    });
    await this.recordings.load();

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

    // TOFO: Handle companion connections
  }

  openpeerconnect = console.log;
  ondbdiscovered = console.log;
  onmessage = console.log;

  handlePeerConnected(ipfsPeer: any) {
    console.log('*** handlePeerConnected, ipfsPeer:', ipfsPeer);
    console.log('*** remote peer id:', ipfsPeer.remotePeer._idB58String);
    const ipfsId = ipfsPeer.remotePeer._idB58String;
    setTimeout(async () => {
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
      throw new Error('Couold not send message');
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

  async add(_collectionName: string, _doc: any): Promise<any> {
    return new Promise((resolve, _reject) => {
      resolve('done')
    })
  }

  async find(_collectionName: string, _query: any = {}): Promise<any> {
    return new Promise((resolve, _reject) => {
      resolve('done')
    })
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

export const db = new AppDatabase(OrbitDB);