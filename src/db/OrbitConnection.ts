import OrbitDB from 'orbit-db';
import type { IPFS } from 'ipfs-core-types';
//@ts-ignore
import { PeerInfo } from 'ipfs';
import { createIpfsNode } from '@/db/utils';
import { Companion, CompanionStatus } from '@/common/Companion.interface';
import KeyValueStore from 'orbit-db-kvstore';
import { UserRepository } from './Repository';
import { AccountInfo } from '@/common/AccountInfo.interface';

interface OrbitAccessControllerOptions {
  accessController: {
    type: string;
    write: string[];
  };
}

interface OrbitDBWithPeerInfo extends OrbitDB {
  peerInfo: PeerInfo;
}

export class OrbitConnection {
  public static _instance: OrbitConnection;
  public orbitdb: OrbitDBWithPeerInfo;
  public node: IPFS;
  public user: KeyValueStore<AccountInfo>;
  public companions: KeyValueStore<Companion>;
  private defaultOptions: OrbitAccessControllerOptions;
  private peerConnectTimeout: ReturnType<typeof setTimeout>;
  private companionConnectionInterval: ReturnType<typeof setInterval>;
  private loadCompanionsTimeout: ReturnType<typeof setTimeout>;

  public initialized: boolean = false;
  private initializing: boolean = false;
  public peerInfo: PeerInfo;

  public desktopPeerId: string | undefined;
  public recordingsAddrRoot: string | undefined;

  async connect(desktopPeerId?: string, recordingsAddrRoot?: string) {
    if (this.initialized || this.initializing) return;
    this.initializing = true;
    this.desktopPeerId = desktopPeerId;
    this.recordingsAddrRoot = recordingsAddrRoot;
    /**
     * Establish IPFS connection and set peer info
     */
    try {
      this.node = this.node || (await createIpfsNode());
      this.peerInfo = await this.node.id();
    } catch (err) {
      console.error('Could not create IPFS node:', err);
      throw new Error('Could not create IPFS node');
    }

    /**
     * Create OrbitDB instance
     */
    let orbitdb;
    try {
      this.orbitdb = (await OrbitDB.createInstance(this.node, {
        //@ts-ignore
        offline: process.env.NODE_ENV === 'test',
      })) as OrbitDBWithPeerInfo;

      // orbitdb.peerInfo = this.node.id();
    } catch (err) {
      console.error('Could not create OrbitDB instance:', err);
      throw new Error('Could not create OrbitDB instance');
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
     * Users key-value store
     */
    this.user = await new UserRepository(
      this.node,
      this.orbitdb,
      'user'
    ).init();

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
        const loadCompanionsAbortController = new AbortController();

        loadCompanionsAbortController.signal.addEventListener(
          'abort',
          async () => {
            console.log('### ABORT SIGNAL TRIGGERED ###');
            await this.companions.drop();
            clearTimeout(this.loadCompanionsTimeout);
            await loadCompanions();
          }
        );

        this.loadCompanionsTimeout = setTimeout(
          () => loadCompanionsAbortController.abort(),
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
    this.initializing = false;

    return orbitdb;
  }

  private async connectToPeer(peerId: string) {
    const SIG_SERVER =
      '/dns4/cryptic-thicket-32566.herokuapp.com/tcp/443/wss/p2p-webrtc-star/p2p/';

    try {
      console.log('*** Connecting to peer ', SIG_SERVER + peerId);
      await this.node.swarm.connect(SIG_SERVER + peerId);
      console.log('*** Connected to peer!');
    } catch (err) {
      throw err;
    }
  }

  private async handlePeerConnected(ipfsPeer: any) {
    const ipfsId = ipfsPeer.remotePeer._idB58String;

    this.peerConnectTimeout = setTimeout(async () => {
      await this.sendMessage(ipfsId, {
        //@ts-ignore
        userDb: this.user.id,
        // recordingsDb: this.docStores[RECORDINGS_COLLECTION].identity.id,
      });
    }, 2000);
    // if (this.openpeerconnect) this.openpeerconnect(ipfsId);
  }

  private async sendMessage(topic: string, message: any) {
    try {
      const msgString = JSON.stringify(message);
      const messageBuffer = Buffer.from(msgString);
      await this.node.pubsub.publish(topic, messageBuffer);
    } catch (err) {
      console.error('Could not send message:', err);
      throw new Error('Could not send message');
    }
  }

  private async handleMessageReceived(msg: any) {
    const parsedMsg = JSON.parse(msg.data.toString());
    const msgKeys = Object.keys(parsedMsg);

    switch (msgKeys[0]) {
      case 'userDb':
        const peerDb = await this.orbitdb.open(parsedMsg.userDb);

        peerDb.events.on('replicated', async () => {
          //@ts-ignore
          await this.companions.set(peerDb.id, {
            ...peerDb.all,
            status: CompanionStatus.Online,
          });

          // this.onPeerDbDiscovered && this.onPeerDbDiscovered(peerDb);
        });
        break;
      default:
        break;
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
    const companions = this.companions.all;
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

  private async getIpfsPeerIds() {
    const peerIds = (await this.node.swarm.peers()).map((peer) => peer.peer);
    console.log('Connected IPFS peers:', peerIds);
    return peerIds;
  }

  async removeAllCompanions() {
    try {
      await this.companions.drop();
    } catch (error) {
      console.error('Could not drop companions store:', error);
    }
  }

  public static get Instance() {
    return this._instance || (this._instance = new this());
  }
}
