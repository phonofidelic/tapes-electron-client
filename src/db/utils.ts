import { create } from 'ipfs-core';
import type { IPFS } from 'ipfs-core-types'
//@ts-ignore
import WebRTCStar from 'libp2p-webrtc-star';
import { NOISE } from '@chainsafe/libp2p-noise';

declare const LIBP2P_SIG_SERVER: string

export async function createIpfsNode(): Promise<IPFS> {
  const config = {
    libp2p: {
      modules: {
        transports: [
          WebRTCStar,
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
            connEncryption: [NOISE]
          },
        },
      },
      transportManager: { faultTolerance: 1 }
    },
    relay: {
      enabled: true,
      hop: {
        enabled: true,
        active: true
      }
    },
    config: {
      //@ts-ignore
      Bootstrap: [],
      Addresses: {
        //@ts-ignore
        Swarm: [
          LIBP2P_SIG_SERVER
        ],
      }
    },
    repo: process.env.NODE_ENV === 'test' ? './ipfs-test' : './ipfs',
    EXPERIMENTAL: { pubsub: true }
  }

  //@ts-ignore
  const node = await create(config)

  //@ts-ignore
  return node
}