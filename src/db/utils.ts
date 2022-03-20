import fs from 'fs/promises'
import path from 'path'
import util from 'util'
import appRootDir from 'app-root-dir';

// import { create } from 'ipfs'
import { create } from 'ipfs-core';
import type { IPFS } from 'ipfs-core-types'
//@ts-ignore
import wrtc from '@koush/wrtc';
// import wrtc from 'node-webrtc'
// import wrtc from 'wrtc'
//@ts-ignore
import WebRTCStar from 'libp2p-webrtc-star';
//@ts-ignore
import Websockets from 'libp2p-websockets';
//@ts-ignore
// import WebRTCDirect from 'libp2p-webrtc-direct';
import { NOISE } from '@chainsafe/libp2p-noise';

export async function createIpfsNode(): Promise<IPFS> {
  const defaultConfig = {
    libp2p: {
      modules: {
        //@ts-ignore
        transports: [
          WebRTCStar,
          // Websockets,
          // WebRTCDirect
        ]
      },
      config: {
        peerDiscovery: {
          webRTCStar: {
            enabled: true
          }
        },
        transport: {
          WebRTCStar: {
            wrtc,
            connEncryption: [NOISE]
          },
          transportManager: {
            supportDialOnly: true
          }
        },
      }
    },
    relay: {
      enabled: true,
      hop: {
        enabled: true,
        active: true
      }
    },
    config: {
      Addresses: {
        //@ts-ignore
        Swarm: [
          // '/dns4/cryptic-thicket-32566.herokuapp.com/tcp/443/wss/p2p-webrtc-star/'
        ]
      }
    },
    repo: './ipfs',
    EXPERIMENTAL: { pubsub: true }
  }

  //@ts-ignore
  const node = await create(defaultConfig)

  return node
}