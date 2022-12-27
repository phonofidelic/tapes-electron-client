import { create } from 'ipfs-core';
import type { IPFS } from 'ipfs-core-types';
import WebRTCStar from 'libp2p-webrtc-star';
import { NOISE } from '@chainsafe/libp2p-noise';
import { Libp2p } from 'libp2p/src/connection-manager';

declare const LIBP2P_SIG_SERVER: string;

export async function createIpfsNode(): Promise<IPFS & { libp2p: Libp2p }> {
  const config = {
    libp2p: {
      modules: {
        transports: [WebRTCStar],
      },
      config: {
        peerDiscovery: {
          webRTCStar: {
            enabled: true,
          },
        },
        transport: {
          WebRTCStar: {
            connEncryption: [NOISE],
          },
        },
      },
      transportManager: { faultTolerance: 1 },
    },
    relay: {
      enabled: true,
      hop: {
        enabled: true,
        active: true,
      },
    },
    config: {
      Bootstrap: [] as string[],
      Addresses: {
        Swarm: [LIBP2P_SIG_SERVER],
      },
    },
    repo: process.env.NODE_ENV === 'test' ? './ipfs-test' : './ipfs',
    EXPERIMENTAL: { ipnsPubsub: true },
  };
  // TODO: Look into if libp2p is misconfigured.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const node = (await create(config)) as unknown as IPFS & { libp2p: Libp2p };
  return node;
}
