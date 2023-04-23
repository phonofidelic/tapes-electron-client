import * as ipfs from 'ipfs-core';
import type { IPFS } from 'ipfs-core-types';
import { noise } from '@chainsafe/libp2p-noise';
import { mplex } from '@libp2p/mplex';
import { gossipsub } from '@chainsafe/libp2p-gossipsub';
// eslint-disable-next-line import/no-unresolved
import { Libp2p } from 'libp2p';
// eslint-disable-next-line import/no-unresolved
import { webRTC } from '@libp2p/webrtc';

declare const LIBP2P_SIG_SERVER: string;

export type IpfsWithLibp2p = IPFS & { libp2p: Libp2p };

export async function createIpfsNode(): Promise<IpfsWithLibp2p> {
  const libp2pConfig = {
    addresses: {
      listen: [LIBP2P_SIG_SERVER],
    },
    transports: [webRTC({})],
    connectionEncryption: [noise()],
    streamMuxers: [mplex()],
    pubsub: gossipsub({
      allowPublishToZeroPeers: true,
      floodPublish: true,
    }),
  };

  const config = {
    libp2p: libp2pConfig,
    repo: process.env.NODE_ENV === 'test' ? './ipfs-test' : './ipfs',
    EXPERIMENTAL: { ipnsPubsub: true },
  };
  // TODO: Look into if libp2p is misconfigured.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const node = (await ipfs.create(config)) as IpfsWithLibp2p;

  // const node = (await createLibp2p(libp2pConfig)) as IpfsWithLibp2p;
  return node;
}
