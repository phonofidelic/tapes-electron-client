import Ipfs from 'ipfs';
//@ts-ignore
import OrbitDB from 'orbit-db';
//@ts-ignore
import wrtc from 'wrtc';
//@ts-ignore
import WebRTCStar from 'libp2p-webrtc-star';
//@ts-ignore
import Websockets from 'libp2p-websockets';
//@ts-ignore
import WebRTCDirect from 'libp2p-webrtc-direct';
import { NOISE } from 'libp2p-noise';

export class AppDatabase {
  node: any;
  orbitdb: any;
  defaultOptions: any;
  recordings: any;
  user: any;
  companions: any;

  async init() {
    this.node = await Ipfs.create({
      libp2p: {
        modules: {
          transport: [WebRTCStar, Websockets, WebRTCDirect],
        },
        config: {
          peerDiscovery: {
            webRTCStar: {
              enabled: true,
            },
          },
          transport: {
            WebRTCStar: {
              wrtc,
              connEncryption: [NOISE],
            },
          },
        },
        transportMmanager: { fauleTolerance: 1 },
      },
      relay: {
        eenabled: true,
        hop: {
          enabled: true,
          active: true,
        },
      },
      config: {
        Addresses: {
          Swarm: [
            '/dns4/cryptic-thicket-32566.herokuapp.com/tcp/443/wss/p2p-webrtc-star/',
          ],
        },
      },
      repo: './ipfs',
      EXPERIMENTAL: { pubsub: true },
    });

    this.orbitdb = await OrbitDB.createInstance(this.node);

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
    this.node.libp2p.connectionManager.on(
      'peer:connect',
      this.handlePeerConnected.bind(this)
    );

    await this.node.pubsub.subscribe(
      peerInfo.id,
      this.handleMessageReceived.bind(this)
    );
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
    const msgKeys = Object.keys(parsedMsg);

    switch (msgKeys[0]) {
      case 'userDb':
        var peerDb = await this.orbitdb.open(parsedMsg.userDb);
        peerDb.events.on('replicated', async () => {
          if (peerDb.get('recordings')) {
            await this.companions.set(peerDb.id, peerDb.all);
            this.ondbdiscovered && this.ondbdiscovered(peerDb);
          }
        });
        break;
      default:
        break;
    }

    if (this.onmessage) this.onmessage(msg);
  }

  async sendMessage(topic: string, message: any) {
    try {
      const msgString = JSON.stringify(message);
      const messageBuffer = Buffer.from(msgString);
      await this.node.pubsub.publish(topic, messageBuffer);
    } catch (err) {
      console.error('Couold not sent message:', err);
      throw new Error('Couold not sent message');
    }
  }
}
