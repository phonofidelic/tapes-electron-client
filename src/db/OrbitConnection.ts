/* eslint-disable @typescript-eslint/ban-ts-comment */
import OrbitDB from 'orbit-db';
import { IPFS } from 'ipfs-core-types';
import { multiaddr } from '@multiformats/multiaddr';
import { Companion, CompanionStatus } from '@/common/Companion.interface';
import { createIpfsNode, IpfsWithLibp2p } from '@/db/utils';
import {
  CompanionRepository,
  CompanionStore,
  UserRepository,
  UserStore,
} from '@/db/Repository';
import type { Connection } from '@libp2p/interface-connection';

declare const LIBP2P_SIG_SERVER: string;

interface OrbitAccessControllerOptions {
  accessController: {
    type: string;
    write: string[];
  };
}

export default class OrbitConnection {
  public static _instance: OrbitConnection;
  public orbitdb: OrbitDB;
  public node: IpfsWithLibp2p;
  public user: UserStore;
  public companions: CompanionStore;
  private defaultOptions: OrbitAccessControllerOptions;
  private peerConnectTimeout: ReturnType<typeof setTimeout>;
  private companionConnectionInterval: ReturnType<typeof setInterval>;
  private loadCompanionsTimeout: ReturnType<typeof setTimeout>;

  public initialized = false;
  private initializing = false;
  public peerInfo: Awaited<ReturnType<IPFS['id']>>;

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
    console.log('### recordingsAddrRoot', this.recordingsAddrRoot);

    /*
     * Establish IPFS connection and set peer info
     */
    try {
      this.node = this.node || (await createIpfsNode());
    } catch (err) {
      console.error('Could not create IPFS node:', err);
      throw new Error('Could not create IPFS node');
    }

    /*
     * Create OrbitDB instance
     */
    let orbitdb;
    try {
      this.orbitdb = await OrbitDB.createInstance(this.node);
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
    ).init('user');
    // this.user = await this.orbitdb.keyvalue('user', this.defaultOptions);

    /*
     * Companions key-value store
     */
    // this.companions = await this.orbitdb.keyvalue(
    //   'companions',
    //   this.defaultOptions
    // );

    this.companions = await new CompanionRepository(this, 'companions').init(
      'companion'
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
    this.node.libp2p.addEventListener(
      'peer:connect',
      //@ts-ignore
      (event: CustomEvent<Connection>) => {
        this.handlePeerConnected(event);
      }
    );

    /*
     * Subscribe to topic and listen for incoming messages
     */
    const topic = this.node.libp2p.peerId.toString();

    this.node.libp2p.pubsub.subscribe(topic);

    this.node.libp2p.pubsub.addEventListener('message', (event) => {
      this.handleMessageReceived(event.detail);
    });

    this.node.libp2p.addEventListener('peer:discovery', (event) => {
      this.handleDiscovery(event);
    });

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
        console.log('* Connecting to desktop peer', desktopPeerId);
        await this.connectToPeer(desktopPeerId);
        console.log('*** Connected to desktop peer! ***');
      } catch (err) {
        console.error('Could not connect to desktop peer:', err);
        throw new Error('Could not connect to desktop peer');
      }
    }

    this.initialized = true;
    this.initializing = false;

    return orbitdb;
  }

  private async handleDiscovery(event: CustomEvent) {
    const peerId = event.detail.id.toString();
    try {
      await this.connectToPeer(peerId);
    } catch {
      return;
    }
  }

  private async connectToPeer(peerId: string) {
    try {
      await this.node.libp2p.dial(
        multiaddr(`${LIBP2P_SIG_SERVER}/p2p/${peerId}`)
      );
    } catch (error) {
      // console.error('Could not connect to peer:', error);
      throw new Error('Could not connect to peer');
      const peers = this.node.libp2p.getPeers();
      // console.log(`Deleting ${peers.length} peers`);
      peers.forEach((peer) => this.node.libp2p.peerStore.delete(peer));
    }
  }

  private async handlePeerConnected(ipfsPeer: CustomEvent<Connection>) {
    // console.log('* handlePeerConnected, ipfsPeer', ipfsPeer);
    //@ts-ignore
    const connectionKeys = ipfsPeer.target.connectionManager.connections.keys();
    // console.log('### connectionKeys', connectionKeys);

    this.peerConnectTimeout = setTimeout(async () => {
      for await (const ipfsId of connectionKeys) {
        // console.log('* Sending message to', ipfsId);
        try {
          await this.sendMessage(ipfsId, {
            userDb: this.user.id,
            // recordingsDb: this.docStores[RECORDINGS_COLLECTION].identity.id,
          });
        } catch (error) {
          console.error(`Could not send message to ${ipfsId}`, error);
        }
      }
    }, 2000);
  }

  private async sendMessage(topic: string, message: unknown) {
    try {
      const msgString = JSON.stringify(message, null, 0);
      const messageBuffer = new TextEncoder().encode(msgString);
      await this.node.libp2p.pubsub.publish(topic, messageBuffer);
    } catch (err) {
      console.error('Could not send message:', err);
      throw new Error('Could not send message');
    }
  }

  private async handleMessageReceived(msg: { data: Uint8Array }) {
    const decoder = new TextDecoder('utf8');
    const decodedMessage = decoder.decode(msg.data);
    const parsedMsg = JSON.parse(decodedMessage);

    const msgKeys = Object.keys(parsedMsg);

    let peerDb: UserStore;
    switch (msgKeys[0]) {
      case 'userDb':
        try {
          peerDb = (await this.orbitdb.keyvalue(
            parsedMsg.userDb
          )) as unknown as UserStore;
        } catch (error) {
          console.error('Could not replicate db:', error);
        }

        peerDb.events.on('replicate', async () => {
          await peerDb.load();
          await this.companions.set(peerDb.id, {
            ...peerDb.all,
            // dbAddress: peerDb.address,
            status: CompanionStatus.Online,
          });

          // this.onPeerDbDiscovered && this.onPeerDbDiscovered(peerDb);
        });
        break;

      default:
        // console.error('NOT HANDLED');
        break;
    }
  }

  private async connectToCompanions() {
    const companions = Object.values(this.companions.all)
      // .filter((companion: Companion) => companion.nodeId)
      .map((companion) => companion);
    console.log('* connectToCompanions, companions:', companions);
    // const connectedPeerIds = await this.getIpfsPeerIds();

    await Promise.all(
      companions.map(async (companion) => {
        const companionAddress = this.getCompanionAddress(companion.nodeId);
        // console.log('companionAddress', companionAddress);

        const companionAddressString = `/orbitdb/${companionAddress.root}/${companionAddress.path}`;
        // console.log('companionAddressString', companionAddressString);

        // const companionAddressString = companionAddress;
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

  private getCompanionAddress(companionNodeId: string) {
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
