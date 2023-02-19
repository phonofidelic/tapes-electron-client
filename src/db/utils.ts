import * as ipfs from 'ipfs-core';
import type { IPFS } from 'ipfs-core-types';
// eslint-disable-next-line import/no-unresolved
import { webTransport } from '@libp2p/webtransport';
import { noise } from '@chainsafe/libp2p-noise';
import { mplex } from '@libp2p/mplex';
import { gossipsub } from '@chainsafe/libp2p-gossipsub';
// eslint-disable-next-line import/no-unresolved
import { Libp2p } from 'libp2p';
// eslint-disable-next-line import/no-unresolved
import { webSockets } from '@libp2p/websockets';
// eslint-disable-next-line import/no-unresolved
import { webRTC } from '@libp2p/webrtc';

declare const LIBP2P_SIG_SERVER: string;

export type IpfsWithLibp2p = IPFS & { libp2p: Libp2p };

export async function createIpfsNode(): Promise<IpfsWithLibp2p> {
  const config = {
    libp2p: {
      addresses: {
        listen: [LIBP2P_SIG_SERVER],
      },
      transports: [webRTC(), webTransport(), webSockets()],
      connectionEncryption: [noise()],
      streamMuxers: [mplex()],
      pubsub: gossipsub({ allowPublishToZeroPeers: true }),
      relay: {
        enabled: true,
        hop: {
          enabled: true,
          active: true,
        },
      },
    },
    repo: process.env.NODE_ENV === 'test' ? './ipfs-test' : './ipfs',
    EXPERIMENTAL: { ipnsPubsub: true },
  };
  // TODO: Look into if libp2p is misconfigured.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const node = (await ipfs.create(config)) as IpfsWithLibp2p;
  return node;
}
