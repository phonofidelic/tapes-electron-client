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
//@ts-ignore
import { PeerId, PeerInfo } from 'ipfs';
import Store from 'orbit-db-store';
import { Companion, CompanionStatus } from '../common/Companion.interface';

// const Buffer = require('buffer/').Buffer;

const RECORDINGS_COLLECTION = 'recordings'

interface Collection {
  name: string
}

interface AppDatabaseOptions {
  onPeerConnected?(message: string): void
  onPeerDbDiscovered?(peerDb: any): void
}

export class OrbitDatabase implements AppDatabase {
  private node: IPFS;
  private orbitdb: OrbitDB;
  private defaultOptions: any;
  private user: any;
  private companions: any;
  /** https://stackoverflow.com/a/50428377 */
  private peerConnectTimeout: ReturnType<typeof setTimeout>
  private companionConnectionInterval: ReturnType<typeof setInterval>
  private docStores: { [key: string]: DocumentStore<unknown> } = {}

  public peerInfo: PeerInfo
  public initialized: boolean = false

  private onPeerConnected(_message: string): void { console.log('onPeerConnected not implemented') }
  private onPeerDbDiscovered(_peerDb: Store): void { console.log('onPeerDbDiscovered not implemented') }

  constructor({
    onPeerConnected,
    onPeerDbDiscovered
  }: AppDatabaseOptions) {
    this.onPeerConnected = onPeerConnected
    this.onPeerDbDiscovered = onPeerDbDiscovered
  }

  async init(desktopPeerId?: string) {
    try {
      this.node = await createIpfsNode()
    } catch (err) {
      console.error('Could not create IPFS node:', err)
      throw new Error('Could not create IPFS node')
    }

    try {
      console.log('*** creating orbit instance')
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

    try {
      this.peerInfo = await this.node.id();
    } catch (err) {
      console.error('Coud not set peerInfo:', err)
      throw new Error('Coud not set peerInfo')
    }

    /**
     * TODO: provide accesscontroller that gives access to remote
     * peer after database initialization:
     * https://github.com/orbitdb/orbit-db/blob/main/GUIDE.md#granting-access-after-database-creation
     */
    this.defaultOptions = {
      acessController: {
        type: 'orbitdb',
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

    this.docStores[RECORDINGS_COLLECTION] = await this.orbitdb.docstore(RECORDINGS_COLLECTION, {
      ...docStoreOptions,
    });

    for (const docStore in this.docStores) {
      try {
        await this.docStores[docStore].load()
      } catch (err) {
        console.error(`Could not load docstore ${docStore}:`, err)
        throw new Error(`Could not load docstore "${docStore}"`)
      }
    }

    /**
     * Users key-value store
     */
    this.user = await this.orbitdb.keyvalue('user', this.defaultOptions);
    await this.user.load();

    await this.setUserData({
      // deviceInfo: {
      //   hostname: os.hostname(),
      //   platform: os.platform()
      // },
      docStores: this.getDocStoreIds(),
      nodeId: this.peerInfo.id,
      dbAddress: await this.orbitdb.determineAddress('user', 'keyvalue'),
      deviceName: await this.getDeviceName() || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
    })

    /**
     * Companions key-value store
     */
    this.companions = await this.orbitdb.keyvalue(
      'companions',
      this.defaultOptions
    );
    await this.companions.load();

    /**
     * DEBUG INFO
     */
    console.log('*** peerInfo:', this.peerInfo);

    //@ts-ignore
    const identity = this.orbitdb.identity
    console.log('*** identity:', identity.toJSON())

    console.log('*** recordings address:', this.docStores['recordings'].address.toString())

    console.log('*** user:', this.user.all)

    const address = await this.orbitdb.determineAddress('user', 'keyvalue')
    console.log('*** determineAddress:', address)

    /**
     * Listen for incoming connections
     */
    //@ts-ignore
    this.node.libp2p.connectionManager.on(
      'peer:connect',
      this.handlePeerConnected.bind(this)
    );

    await this.node.pubsub.subscribe(
      this.peerInfo.id,
      this.handleMessageReceived.bind(this)
    );

    /**
     * Handle companion connections
     */
    this.companionConnectionInterval = setInterval(this.connectToCompanions.bind(this), 10000)
    this.connectToCompanions()

    /**
     * Connect to desktop peer if one is provided
     */
    if (desktopPeerId) {
      try {
        await this.connectToPeer(desktopPeerId)
      } catch (err) {
        console.error('Could not connect to desktop peer:', err)
        throw new Error('Could not connect to desktop peer')
      }
    }

    this.initialized = true
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

  async connectToPeer(peerId: string) {
    const SIG_SERVER = '/dns4/cryptic-thicket-32566.herokuapp.com/tcp/443/wss/p2p-webrtc-star/p2p/'

    try {
      console.log('*** Connecting to peer ', SIG_SERVER + peerId)
      await this.node.swarm.connect(SIG_SERVER + peerId)
      console.log('*** Connected to peer!')
    } catch (err) {
      // if (new RegExp(err).test('peer is not available')) return console.warn(`Peer not available: ${peerId}`)
      // console.error('Could not connect to peer:', err)
      throw err
    }
  }

  /**
   * Debug event handlers
   */
  openpeerconnect = async (data: string) => { if ((await this.node.swarm.peers()).length <= 5) console.log('*** peer connected:', data) };
  ondbdiscovered = (data: any) => console.log('*** db discovered:', data);
  onmessage = (data: any) => console.log('*** message recieved:', data);
  oncompaniononline = (data: any) => console.log('*** oncompaniononline:', data)
  // oncompanionnotfound = console.error

  private getDocStoreIds() {
    let docStoreIds = {}

    for (const docStore in this.docStores) {
      //@ts-ignore
      docStoreIds[docStore] = this.docStores[docStore].address
    }

    return docStoreIds
  }

  private async setUserData(fixtureData: any) {
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
      await this.sendMessage(ipfsId, {
        userDb: this.user.id,
        recordingsDb: this.docStores[RECORDINGS_COLLECTION].identity.id
      });
    }, 2000);
    if (this.openpeerconnect) this.openpeerconnect(ipfsId);
  }

  private async handleMessageReceived(msg: any) {
    const parsedMsg = JSON.parse(msg.data.toString());
    console.log('*** handleMessageReceived:', parsedMsg);
    const msgKeys = Object.keys(parsedMsg);

    switch (msgKeys[0]) {
      case 'userDb':
        const peerDb = await this.orbitdb.open(parsedMsg.userDb);
        peerDb.events.on('replicated', async () => {
          //@ts-ignore
          console.log('*** peer db replicated ***', peerDb.get('docStores'))
          //@ts-ignore
          if (peerDb.get('docStores')) {
            //@ts-ignore
            await this.companions.set(peerDb.id, { ...peerDb.all, status: this.companions[peerDb.id]?.status || CompanionStatus.Unknown });
            // this.ondbdiscovered && this.ondbdiscovered(peerDb);
            this.onPeerDbDiscovered && this.onPeerDbDiscovered(peerDb)
          }
        });
        break;
      default:
        break;
    }

    if (this.onmessage) this.onmessage(msg);
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

  private async connectToCompanions() {
    //@ts-ignore
    const companionIds: string[] = Object.values(this.companions.all).map(companion => companion.nodeId)
    // console.log('connectToCompanions, companionIds:', companionIds)
    const connectedPeerIds = await this.getIpfsPeerIds()

    await Promise.all(companionIds.map(async (companionId) => {
      if (connectedPeerIds.indexOf(companionId) !== -1) return
      try {
        await this.connectToPeer(companionId)

        /**
         * Set Companion status as 'online'
         */
        const companionAddress = this.getCompanionAddress(companionId)
        const companionAddressString = `/orbitdb/${companionAddress.root}/${companionAddress.path}`
        this.companions.set(companionAddressString, {
          ...this.companions.get(companionAddressString),
          status: CompanionStatus.Online
        })

        this.oncompaniononline && this.oncompaniononline(`Connected to ${companionId}`)
      } catch (err) {
        // console.error('Companion not found:', err)

        /**
         * Set Companion status as 'offline'
         */
        const companionAddress = this.getCompanionAddress(companionId)
        const companionAddressString = `/orbitdb/${companionAddress.root}/${companionAddress.path}`
        this.companions.set(companionAddressString, {
          ...this.companions.get(companionAddressString),
          status: CompanionStatus.Offline
        })

        // this.oncompanionnotfound && this.oncompanionnotfound()
      }
    }))
  }



  private getCompanionAddress(companionNodeId: string): { path: string; root: string } {
    const companions = this.getAllCompanions()
    const matchedCompanion: Companion | undefined = Object.values(companions).find((companion: Companion) => companion.nodeId === companionNodeId) as Companion
    if (matchedCompanion === undefined) throw new Error(`Attempted to find address for non-existing companion with nodeId ${companionNodeId}`)
    return matchedCompanion.dbAddress
  }

  async getIpfsPeerIds() {
    const peerIds = (await this.node.swarm.peers()).map(peer => peer.peer)
    // console.log('Connected IPFS peers:', peerIds)
    return peerIds
  }

  /**
   * Public DB methods (OrbitDB-specific)
   */
  async queryNetwork(collectionName: string, queryFn: (doc: any) => boolean): Promise<any> {
    const companions: { docStores: { [key: string]: { path: string, root: string } }, nodeId: string }[] = Object.values(this.companions.all)
    const dbAddrs: { path: string, root: string }[] = companions.map(companion => companion.docStores[collectionName])
    console.log('*** queryNetwork, dbAddrs:', dbAddrs)

    try {
      const remoteDocs = await Promise.all(dbAddrs.map(async (addr) => {
        const db = await this.orbitdb.open(`${addr.root}/${addr.path}`)
        try {
          await db.load()
        } catch (err) {
          console.error('Could not load remote DB:', err)
          throw err
        }
        //@ts-ignore
        return db.query(queryFn)
      }))
      console.log('*** queryNetwork, remoteDocs:', remoteDocs)

      const allDocs = remoteDocs.reduce((flatDocs, docs) => flatDocs.concat(docs), this.docStores[collectionName].query(queryFn))
      console.log('*** queryNetwork, allDocs:', allDocs)

      return allDocs
    } catch (err) {
      console.error('Could not query ntwork:', err)
      throw new Error('Could not query ntwork')
    }
  }

  // getCompanions() {
  //   return this.companions.all
  // }

  getAllCompanions() {
    const companions = this.companions.all
    // console.log('*** getAllCompanions, companions:', companions)
    return companions
  }

  async removeAllCompanions() {
    const companions = Object.keys(this.companions.all)
    console.log('*** removeAllCompanions, companions before:', companions)

    for await (const companion of companions) {
      await this.companions.del(companion)
    }
    console.log('*** removeAllCompanions, companions after:', Object.keys(this.companions.all))
  }

  // TODO: implement this or delete if unused
  async deleteDB() {
    return new Promise((resolve, _reject) => {
      resolve('done')
    })
  }

  getUserData() {
    const userData = this.user.all
    console.log('*** userData:', userData)
    return userData
  }

  async setDeviceName(name: string) {
    await this.user.set('deviceName', name)
  }

  getDeviceName() {
    return this.user.get('deviceName')
  }

  /**
   * Public DB methods (general)
   */
  async add(collectionName: string, doc: any): Promise<string> {
    const bytes = jsonEncoder.encode(doc)
    const hash = await sha256.digest(bytes)
    const cid = CID.create(1, jsonEncoder.code, hash)
    const docId = cid.toString(base64.encoder)

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

  /**
   * Close database connection
   */
  async close() {
    console.log('Closing database connections...')
    try {
      // console.log('### IPFS stats:', this.node.stats)
      clearTimeout(this.peerConnectTimeout)
      clearInterval(this.companionConnectionInterval)
      process.env.NODE_ENV !== 'test' && await this.node.pubsub.unsubscribe(this.peerInfo.id, this.handleMessageReceived)
      await this.node.stop()
      // await this.orbitdb.disconnect()
    } catch (err) {
      console.error('Could not close database connections:', err)
    }
    console.log('Database connections closed')
  }
}
