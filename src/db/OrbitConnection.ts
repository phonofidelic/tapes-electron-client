import OrbitDB from 'orbit-db';
import { IPFS } from 'ipfs-core-types';
import KeyValueStore from 'orbit-db-kvstore';
import { Companion, CompanionStatus } from '@/common/Companion.interface';
import { createIpfsNode } from '@/db/utils';
import { UserRepository, UserStore } from '@/db//Repository';
import { Libp2p } from 'libp2p/src/connection-manager';

declare const LIBP2P_SIG_SERVER: string;

interface OrbitAccessControllerOptions {
  accessController: {
    type: string;
    write: string[];
  };
}
interface IPFSWithLibp2p extends IPFS {
  libp2p: Libp2p;
}
export default class OrbitConnection {
  public static _instance: OrbitConnection;
  public orbitdb: OrbitDB;
  public node: IPFSWithLibp2p;
  public user: UserStore;
  public companions: KeyValueStore<Companion>;
  private defaultOptions: OrbitAccessControllerOptions;
  private peerConnectTimeout: ReturnType<typeof setTimeout>;
  private companionConnectionInterval: ReturnType<typeof setInterval>;
  private loadCompanionsTimeout: ReturnType<typeof setTimeout>;

  public initialized = false;
  private initializing = false;
  public peerInfo: Awaited<ReturnType<IPFSWithLibp2p['id']>>;

  public desktopPeerId: string | undefined;
  public recordingsAddrRoot: string | undefined;

  async connect(
    desktopPeerId?: string,
    recordingsAddrRoot?: string
  ): Promise<OrbitDB> {
    if (this.initialized || this.initializing) return;
    this.initializing = true;
    this.desktopPeerId = desktopPeerId;
    this.recordingsAddrRoot = recordingsAddrRoot;
    /*
     * Establish IPFS connection and set peer info
     */
    try {
      this.node = this.node || ((await createIpfsNode()) as IPFSWithLibp2p);
      this.peerInfo = await this.node.id();
    } catch (err) {
      console.error('Could not create IPFS node:', err);
      throw new Error('Could not create IPFS node');
    }

    /*
     * Create OrbitDB instance
     */
    let orbitdb;
    try {
      this.orbitdb = (await OrbitDB.createInstance(this.node)) as OrbitDB;
    } catch (err) {
      console.error('Could not create OrbitDB instance:', err);
      throw new Error('Could not create OrbitDB instance');
    }

    /*
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

    /*
     * Users key-value store
     */
    this.user = await new UserRepository(
      this,
      'user',
      this.recordingsAddrRoot
    ).init();

    /*
     * Companions key-value store
     */
    this.companions = await this.orbitdb.keyvalue(
      'companions',
      this.defaultOptions
    );

    /*
     * If loading companions key-val store takes more than 15 sec,
     * drop the current store and try again.
     */
    const loadCompanions = async () => {
      try {
        const loadCompanionsAbortController = new AbortController();

        loadCompanionsAbortController.signal.addEventListener(
          'abort',
          async () => {
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
      } catch (error) {
        throw new Error('Could not load companions');
      }
    };
    await loadCompanions();
    clearTimeout(this.loadCompanionsTimeout);

    /*
     * Listen for incoming connections
     */
    this.node.libp2p.connectionManager.on(
      'peer:connect',
      this.handlePeerConnected.bind(this)
    );

    await this.node.pubsub.subscribe(
      this.peerInfo.id,
      this.handleMessageReceived.bind(this)
    );

    /*
     * Handle companion connections
     */
    this.companionConnectionInterval = setInterval(
      this.connectToCompanions.bind(this),
      10000
    );
    this.connectToCompanions();

    /*
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
    await this.node.swarm.connect(`${LIBP2P_SIG_SERVER}/p2p/${peerId}`);
  }

  private async handlePeerConnected(ipfsPeer: {
    remotePeer: { _idB58String: string };
  }) {
    const ipfsId = ipfsPeer.remotePeer._idB58String;

    this.peerConnectTimeout = setTimeout(async () => {
      await this.sendMessage(ipfsId, {
        userDb: this.user.id,
        // recordingsDb: this.docStores[RECORDINGS_COLLECTION].identity.id,
      });
    }, 2000);
  }

  private async sendMessage(topic: string, message: unknown) {
    try {
      const msgString = JSON.stringify(message);
      const messageBuffer = Buffer.from(msgString);
      await this.node.pubsub.publish(topic, messageBuffer);
    } catch (err) {
      console.error('Could not send message:', err);
      throw new Error('Could not send message');
    }
  }

  private async handleMessageReceived(msg: { data: unknown }) {
    const parsedMsg = JSON.parse(msg.data.toString());
    const msgKeys = Object.keys(parsedMsg);

    let peerDb: UserStore;
    switch (msgKeys[0]) {
      case 'userDb':
        peerDb = (await this.orbitdb.open(
          parsedMsg.userDb
        )) as unknown as UserStore;

        peerDb.events.on('replicated', async () => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
    const companions = Object.values(this.companions.all)
      .filter((companion: Companion) => companion.nodeId)
      .map((companion) => companion);
    // console.log('connectToCompanions, companionIds:', companionIds)
    // const connectedPeerIds = await this.getIpfsPeerIds();

    await Promise.all(
      companions.map(async (companion) => {
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
          /*
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

          /*
           * Set Companion status as 'online'
           */
          await this.companions.set(companionAddressString, {
            ...prevState,
            status: CompanionStatus.Online,
          });
        } catch (err) {
          /*
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
