// import os from 'os'
//@ts-ignore
import OrbitDB from 'orbit-db';
import type { IPFS } from 'ipfs-core-types';
import { CID } from 'multiformats/cid';
import * as jsonEncoder from 'multiformats/codecs/json';
import { sha256 } from 'multiformats/hashes/sha2';
import { base64 } from 'multiformats/bases/base64';
import { generateUsername } from 'unique-username-generator';
import { createIpfsNode } from './utils';
import { AppDatabase } from './AppDatabase.interface';
import DocumentStore from 'orbit-db-docstore';
//@ts-ignore
import { PeerId, PeerInfo } from 'ipfs';
import Store from 'orbit-db-store';
import { Companion, CompanionStatus } from '../common/Companion.interface';
import { AccountInfo } from '../common/AccountInfo.interface';

// const Buffer = require('buffer/').Buffer;

const RECORDINGS_COLLECTION = 'recordings';

interface Collection {
  name: string;
}

interface AppDatabaseOptions {
  onPeerConnected?(message: string): void;
  onPeerDbDiscovered?(peerDb: any): void;
}

export class OrbitDatabase implements AppDatabase {
  private node: IPFS;
  private orbitdb: OrbitDB;
  private defaultOptions: any;
  private user: any;
  private companions: any;
  /** https://stackoverflow.com/a/50428377 */
  private peerConnectTimeout: ReturnType<typeof setTimeout>;
  private companionConnectionInterval: ReturnType<typeof setInterval>;
  private loadCompanionsTimeout: ReturnType<typeof setTimeout>;
  private docStores: { [key: string]: DocumentStore<unknown> } = {};

  public peerInfo: PeerInfo;
  public initialized: boolean = false;

  private onPeerConnected(_message: string): void {
    console.log('onPeerConnected not implemented');
  }
  private onPeerDbDiscovered(_peerDb: Store): void {
    console.log('onPeerDbDiscovered not implemented');
  }

  constructor({ onPeerConnected, onPeerDbDiscovered }: AppDatabaseOptions) {
    this.onPeerConnected = onPeerConnected;
    this.onPeerDbDiscovered = onPeerDbDiscovered;
  }

  async init(desktopPeerId?: string, recordingsAddrRoot?: string) {
    try {
      this.node = await createIpfsNode();
    } catch (err) {
      console.error('Could not create IPFS node:', err);
      throw new Error('Could not create IPFS node');
    }

    try {
      console.log('*** creating orbit instance');
      this.orbitdb = await OrbitDB.createInstance(this.node, {
        //@ts-ignore
        offline: process.env.NODE_ENV === 'test',
        // id: process.env.NODE_ENV === 'test' ? 'test_' + Date.now() : undefined
      });
      // this.orbitdb = await new OrbitDB.default(this.node)
    } catch (err) {
      console.error('Could not create OrbitDB instance:', err);
      throw new Error('Could not create OrbitDB instance');
    }

    try {
      this.peerInfo = await this.node.id();
    } catch (err) {
      console.error('Coud not set peerInfo:', err);
      throw new Error('Coud not set peerInfo');
    }

    /**
     * TODO: provide accesscontroller that gives access to remote
     * peer after database initialization:
     * https://github.com/orbitdb/orbit-db/blob/main/GUIDE.md#granting-access-after-database-creation
     */
    this.defaultOptions = {
      accessController: {
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
      accessController: {
        type: 'orbitdb',
        write: ['*'],
      },
    };

    const recordingsAddress = recordingsAddrRoot
      ? `/orbitdb/${recordingsAddrRoot}/${RECORDINGS_COLLECTION}`
      : RECORDINGS_COLLECTION;

    this.docStores[RECORDINGS_COLLECTION] = await this.orbitdb.docstore(
      recordingsAddress,
      {
        ...docStoreOptions,
      }
    );

    for (const docStore in this.docStores) {
      try {
        console.log(
          '*** loading docstore:',
          this.docStores[docStore].address.path
        );
        await this.docStores[docStore].load();
      } catch (err) {
        console.error(`Could not load docstore ${docStore}:`, err);
        // throw new Error(`Could not load docstore "${docStore}"`)
      }
    }

    /**
     * Users key-value store
     */
    this.user = await this.orbitdb.keyvalue('user', this.defaultOptions);
    console.log('*** loading key-val store:', this.user.address.path);
    console.log(
      '* determineAddress:',
      await this.orbitdb.determineAddress('user', 'keyvalue')
    );
    console.log('* this.user.address:', this.user.address);
    await this.user.load();

    console.log('### DEVICE NAME:', await this.getDeviceName());
    await this.setUserData({
      // deviceInfo: {
      //   hostname: os.hostname(),
      //   platform: os.platform()
      // },
      docStores: this.getDocStoreIds(),
      nodeId: this.peerInfo.id,
      // dbAddress: await this.orbitdb.determineAddress('user', 'keyvalue'),
      dbAddress: this.user.address,
      deviceName: await this.getDeviceName(),
      // || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
      //@ts-ignore
      // identity: await this.orbitdb.identity.toJSON()
    });

    /**
     * Companions key-value store
     */
    this.companions = await this.orbitdb.keyvalue(
      'companions',
      this.defaultOptions
    );
    console.log('*** loading key-val store:', this.companions.address.path);

    /**
     * If loading companions key-val store takes more than 15 sec,
     * drop the current store and try again.
     */
    const loadCompanions = async () => {
      try {
        const loadCompanionsAC = new AbortController();

        loadCompanionsAC.signal.addEventListener('abort', async () => {
          console.log('### ABORT SIGNAL TRIGGERED ###');
          await this.companions.drop();
          clearTimeout(this.loadCompanionsTimeout);
          await loadCompanions();
        });

        this.loadCompanionsTimeout = setTimeout(
          () => loadCompanionsAC.abort(),
          15000
        );

        await this.companions.load();
        const companions = this.companions.all;
        const companionKeys = Object.keys(companions);

        // companionKeys.forEach((key) => {
        //   console.log(`* companion ${key}:`, companions[key]);
        // });

        for (const key of companionKeys) {
          console.log(`* companion ${key}:`, companions[key]);
        }
      } catch (err) {
        console.error('Could not load companions:', err);
        throw new Error('Could not load companions');
      }
      console.log('*** done loading companions ***');
    };
    await loadCompanions();
    clearTimeout(this.loadCompanionsTimeout);

    /**
     * DEBUG INFO
     */
    console.log('*** peerInfo:', this.peerInfo);

    //@ts-ignore
    const identity = this.orbitdb.identity;
    console.log('*** identity:', identity.toJSON());

    console.log(
      '*** recordings address:',
      this.docStores['recordings'].address.toString()
    );

    console.log('*** user:', this.user.all);

    const address = await this.orbitdb.determineAddress('user', 'keyvalue');
    console.log('*** determineAddress:', address);

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
    this.companionConnectionInterval = setInterval(
      this.connectToCompanions.bind(this),
      10000
    );
    this.connectToCompanions();

    /**
     * Connect to desktop peer if one is provided
     */
    if (desktopPeerId) {
      try {
        await this.connectToPeer(desktopPeerId);
      } catch (err) {
        console.error('Could not connect to desktop peer:', err);
        throw new Error('Could not connect to desktop peer');
      }
    }

    this.initialized = true;
    return this;
  }

  async connectToPeer(peerId: string) {
    const SIG_SERVER =
      '/dns4/cryptic-thicket-32566.herokuapp.com/tcp/443/wss/p2p-webrtc-star/p2p/';

    try {
      console.log('*** Connecting to peer ', SIG_SERVER + peerId);
      await this.node.swarm.connect(SIG_SERVER + peerId);
      console.log('*** Connected to peer!');
    } catch (err) {
      // if (new RegExp(err).test('peer is not available')) return console.warn(`Peer not available: ${peerId}`)
      // console.error(`Could not connect to peer ${peerId}:`, err);
      throw err;
    }
  }

  /**
   * Debug event handlers
   */
  openpeerconnect = async (data: string) => {
    if ((await this.node.swarm.peers()).length <= 5)
      console.log('*** peer connected:', data);
  };
  ondbdiscovered = (data: any) => console.log('*** db discovered:', data);
  onmessage = (data: any) => console.log('*** message recieved:', data);
  oncompaniononline = (data: any) =>
    console.log('*** oncompaniononline:', data);
  // oncompanionnotfound = console.error

  private getDocStoreIds() {
    let docStoreIds = {};

    for (const docStore in this.docStores) {
      //@ts-ignore
      docStoreIds[docStore] = this.docStores[docStore].address;
    }

    return docStoreIds;
  }

  private async setUserData(fixtureData: any) {
    const fixtureKeys = Object.keys(fixtureData);
    for (const i in fixtureKeys) {
      const key = fixtureKeys[i];
      // if (!this.user.get(key)) await this.user.set(key, fixtureData[key])
      await this.user.set(key, fixtureData[key]);
    }
  }

  private handlePeerConnected(ipfsPeer: any) {
    // console.log('*** handlePeerConnected, ipfsPeer:', ipfsPeer)

    const ipfsId = ipfsPeer.remotePeer._idB58String;

    this.peerConnectTimeout = setTimeout(async () => {
      await this.sendMessage(ipfsId, {
        userDb: this.user.id,
        recordingsDb: this.docStores[RECORDINGS_COLLECTION].identity.id,
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
        //@ts-ignore
        console.log('### peerDB.id:', peerDb.id);
        peerDb.events.on('replicated', async () => {
          //@ts-ignore
          // console.log('*** peer db replicated ***', peerDb.get('docStores'))
          //@ts-ignore
          // if (peerDb.get('docStores')) {
          //@ts-ignore
          await this.companions.set(peerDb.id, {
            ...peerDb.all,
            //@ts-ignore
            // prettier-ignore
            status: CompanionStatus.Online,
            // status: this.companions[peerDb.id]?.status || CompanionStatus.Unknown,
          });
          // this.ondbdiscovered && this.ondbdiscovered(peerDb);
          this.onPeerDbDiscovered && this.onPeerDbDiscovered(peerDb);
          // }
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
    const companions: any = Object.values(this.companions.all)
      .filter((companion: Companion) => companion.nodeId)
      .map((companion) => companion);
    // console.log('connectToCompanions, companionIds:', companionIds)
    const connectedPeerIds = await this.getIpfsPeerIds();

    await Promise.all(
      companions.map(async (companion: any) => {
        const companionAddress = this.getCompanionAddress(companion.nodeId);
        const companionAddressString = `/orbitdb/${companionAddress.root}/${companionAddress.path}`;
        const prevState = this.companions.get(companionAddressString);
        if (!prevState) {
          throw new Error(
            `No state found for companion ${companionAddressString}`
          );
        }
        try {
          // if (connectedPeerIds.indexOf(companion.nodeId) !== -1) return;
          /**
           * Grant write access to Recordings DB
           * BUG: this does not seem to work. Current workaround is
           * to give write access to all connected companions for the
           * recordings docStore.
           */
          // console.log('*** Granting write access to', companion.identity.id);
          // //@ts-ignore
          // await this.docStores[RECORDINGS_COLLECTION].access.grant(
          //   'write',
          //   companion.identity.id
          // );
          // console.log('*** Access granted ***');

          await this.connectToPeer(companion.nodeId);

          /**
           * Set Companion status as 'online'
           */
          await this.companions.set(companionAddressString, {
            ...prevState,
            status: CompanionStatus.Online,
          });

          this.oncompaniononline &&
            this.oncompaniononline(`Connected to ${companion.nodeId}`);
        } catch (err) {
          console.error('Companion not found:', err);

          /**
           * Set Companion status as 'offline'
           */
          await this.companions.set(companionAddressString, {
            ...prevState,
            status: CompanionStatus.Offline,
          });

          // this.oncompanionnotfound && this.oncompanionnotfound()
        }
      })
    ).catch((err) => {
      console.error('connectToCompanions error:', err);
    });
  }

  private getCompanionAddress(companionNodeId: string): {
    path: string;
    root: string;
  } {
    if (!companionNodeId) throw new Error('No valid node ID was provided');
    const companions = this.getAllCompanions();
    const matchedCompanion: Companion | undefined = Object.values(
      companions
    ).find(
      (companion: Companion) => companion.nodeId === companionNodeId
    ) as Companion;
    if (matchedCompanion === undefined)
      throw new Error(
        `Attempted to find address for non-existing companion with nodeId ${companionNodeId}`
      );

    return matchedCompanion.dbAddress;
  }

  async getIpfsPeerIds() {
    const peerIds = (await this.node.swarm.peers()).map((peer) => peer.peer);
    console.log('Connected IPFS peers:', peerIds);
    return peerIds;
  }

  /**
   * Public DB methods (OrbitDB-specific)
   */
  async queryNetwork(
    collectionName: string,
    queryFn: (doc: any) => boolean
  ): Promise<any> {
    const companions: {
      docStores: { [key: string]: { path: string; root: string } };
      nodeId: string;
    }[] = Object.values(this.companions.all);
    const dbAddrs: { path: string; root: string }[] = companions.map(
      (companion) => companion.docStores[collectionName]
    );
    console.log('*** queryNetwork, dbAddrs:', dbAddrs);

    try {
      const remoteDocs = await Promise.all(
        dbAddrs.map(async (addr) => {
          const db = await this.orbitdb.open(`${addr.root}/${addr.path}`);
          try {
            await db.load();
          } catch (err) {
            console.error('Could not load remote DB:', err);
            throw err;
          }
          //@ts-ignore
          return db.query(queryFn);
        })
      );
      console.log('*** queryNetwork, remoteDocs:', remoteDocs);

      const allDocs = remoteDocs.reduce(
        (flatDocs, docs) => flatDocs.concat(docs),
        this.docStores[collectionName].query(queryFn)
      );
      console.log('*** queryNetwork, allDocs:', allDocs);

      return allDocs;
    } catch (err) {
      console.error('Could not query network:', err);
      throw new Error('Could not query network');
    }
  }

  getAllCompanions() {
    const companions = this.companions.all;
    // console.log('*** getAllCompanions, companions:', companions)
    return companions;
  }

  async removeAllCompanions() {
    const companions = Object.keys(this.companions.all);
    console.log('*** removeAllCompanions, companions before:', companions);

    // for await (const companion of companions) {
    //   await this.companions.del(companion)
    // }
    try {
      await this.companions.drop();
    } catch (err) {
      console.error('Could not drop companions store:', err);
    }
    console.log(
      '*** removeAllCompanions, companions after:',
      Object.keys(this.companions.all)
    );
  }

  // TODO: implement this or delete if unused
  async deleteDB() {
    return new Promise((resolve, _reject) => {
      resolve('done');
    });
  }

  getAccountInfo() {
    const accountInfo = this.user.all;
    return accountInfo;
  }

  async setDeviceName(deviceName: string) {
    if (!deviceName) deviceName = generateUsername('-');
    await this.user.set('deviceName', deviceName);
  }

  getDeviceName() {
    let deviceName = this.user.get('deviceName');
    if (!deviceName) deviceName = generateUsername('-');
    return deviceName;
  }

  async setAccountInfo(key: keyof AccountInfo, value: AccountInfo) {
    try {
      await this.user.set(key, value);
    } catch (err) {
      console.error('Could not set account info:', err);
      throw new Error('Could not set account info');
    }
  }

  /**
   * Public DB methods (general)
   */
  async add(collectionName: string, doc: any): Promise<string> {
    const bytes = jsonEncoder.encode(doc);
    const hash = await sha256.digest(bytes);
    const cid = CID.create(1, jsonEncoder.code, hash);
    const docId = cid.toString(base64.encoder);

    await this.docStores[collectionName].put({ ...doc, _id: docId });
    return docId;
  }

  async find(collectionName: string, query: any = {}): Promise<any[]> {
    let results: any[] = [];

    const keys = Object.keys(query);

    /**
     * If query is empty, return all recordings
     */
    if (!keys.length) {
      return this.docStores[collectionName].get('');
    }

    /**
     * Otherwise, collect and return query results
     */
    keys.forEach((key) => {
      results = [
        ...results,
        ...this.docStores[collectionName].query(
          (doc: any) => doc[key] === query[key]
        ),
      ];
    });

    return results;
  }

  async findById(collectionName: string, docId: string): Promise<any> {
    return this.docStores[collectionName].query(
      (doc: any) => doc._id === docId
    )[0];
  }

  async update(
    collectionName: string,
    docId: string,
    update: any
  ): Promise<any> {
    let document = await this.findById(collectionName, docId);

    document = {
      ...document,
      ...update,
    };

    await this.docStores[collectionName].put(document);
    return document;
  }

  async delete(collectionName: string, docId: string): Promise<string> {
    await this.docStores[collectionName].del(docId);

    return docId;
  }

  /**
   * Close database connection
   */
  async close() {
    console.log('Closing database connections...');
    try {
      // console.log('### IPFS stats:', this.node.stats)
      clearTimeout(this.peerConnectTimeout);
      clearInterval(this.companionConnectionInterval);
      process.env.NODE_ENV !== 'test' &&
        (await this.node.pubsub.unsubscribe(
          this.peerInfo.id,
          this.handleMessageReceived
        ));
      await this.node.stop();
      // await this.orbitdb.disconnect()
    } catch (err) {
      console.error('Could not close database connections:', err);
    }
    console.log('Database connections closed');
  }
}
