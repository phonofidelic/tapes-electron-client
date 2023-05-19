import path from 'path';
import fs from 'fs/promises';
import { IpcMainEvent, app } from 'electron';
import { noise } from '@chainsafe/libp2p-noise';
import { mplex } from '@libp2p/mplex';
import { webRTC } from '@libp2p/webrtc';
// eslint-disable-next-line import/no-unresolved
import { webSockets } from '@libp2p/websockets';
import { createLibp2p } from 'libp2p';
import {
  circuitRelayServer,
  circuitRelayTransport,
} from 'libp2p/circuit-relay';
import * as filters from '@libp2p/websockets/filters';
import { createFromPrivKey } from '@libp2p/peer-id-factory';
import { peerIdFromString } from '@libp2p/peer-id';
// eslint-disable-next-line import/no-unresolved
import * as crypto from '@libp2p/crypto';
import { IpcChannel } from '../IPC/IpcChannel.interface';
import { IpcRequest } from '../IPC/IpcRequest.interface';

export class StartRelayServerChannel implements IpcChannel {
  private savedRelayMultuaddress: string | undefined;

  get name() {
    return 'relay:start';
  }

  async handle(event: IpcMainEvent, request: IpcRequest) {
    if (this.savedRelayMultuaddress) {
      event.sender.send(request.responseChannel, {
        data: this.savedRelayMultuaddress,
      });

      return;
    }

    let savedPeerId;
    const peerIdFilePath =
      process.env.NODE_ENV === 'production'
        ? path.join(process.resourcesPath, 'Data', 'peerId.json')
        : path.join(app.getAppPath(), 'Data', 'peerId.json');

    try {
      const privateKey = await fs.readFile(peerIdFilePath, {
        encoding: 'utf-8',
      });
      savedPeerId = await createFromPrivKey(
        await crypto.keys.importKey(privateKey, process.env.RELAY_SERVER_SECRET)
      );
    } catch {
      const keyPair = await crypto.keys.generateKeyPair('RSA', 1024);
      const privateKey = await keyPair.export(
        process.env.RELAY_SERVER_SECRET,
        'libp2p-key'
      );
      const newPeerId = await createFromPrivKey(
        await crypto.keys.importKey(privateKey, process.env.RELAY_SERVER_SECRET)
      );

      await fs.writeFile(peerIdFilePath, privateKey, {
        encoding: 'utf8',
      });
      savedPeerId = newPeerId;
    }

    const peerId =
      typeof savedPeerId === 'string'
        ? peerIdFromString(savedPeerId as string)
        : savedPeerId;

    let server;
    try {
      server = await createLibp2p({
        addresses: {
          listen: ['/ip4/127.0.0.1/tcp/9090/wss'],
        },
        transports: [
          webSockets({
            filter: filters.all,
          }),
          webRTC({}),
          circuitRelayTransport({
            discoverRelays: 1,
          }),
        ],
        connectionEncryption: [noise()],
        streamMuxers: [mplex()],
        relay: circuitRelayServer({}),
        peerId,
      });
    } catch (error) {
      console.error(error);
      event.sender.send(request.responseChannel, {
        error: new Error('Could not start relay server'),
      });
      return;
    }

    const relayMultiaddresses = server
      .getMultiaddrs()
      .map((ma) => ma.toString());
    console.log(
      '*** Relay server listening on p2p addr: ',
      relayMultiaddresses
    );

    this.savedRelayMultuaddress = relayMultiaddresses[0];

    event.sender.send(request.responseChannel, {
      data: this.savedRelayMultuaddress,
    });
  }
}
