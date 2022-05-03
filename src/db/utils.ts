// import { create } from 'ipfs'
import { create } from 'ipfs-core';
import type { IPFS } from 'ipfs-core-types'
//@ts-ignore
// import wrtc from '@koush/wrtc';
// import wrtc from 'wrtc'
//@ts-ignore
import WebRTCStar from 'libp2p-webrtc-star';
import { NOISE } from '@chainsafe/libp2p-noise';
// @ts-ignore
// import Websockets from 'libp2p-websockets';
// import TCP from 'libp2p-tcp'
// //@ts-ignore
// // import WebRTCDirect from 'libp2p-webrtc-direct';

// // import { NOISE } from 'libp2p-noise'
// import Libp2p from 'libp2p'
// //@ts-ignore
// import WebSocketStar from 'libp2p-websocket-star'
// //@ts-ignore
// import Mplex from 'libp2p-mplex'
// import Bootstrap from 'libp2p-bootstrap'
// //@ts-ignore
// import MDNS from 'libp2p-mdns'
// import KadDHT from 'libp2p-kad-dht'
// import { LevelDatastore } from 'datastore-level'
// import Gossipsub from 'libp2p-gossipsub'

/**
 * https://github.com/ipfs/js-ipfs/blob/bf92fb321a66651a63a8b9cc81112f149573826a/examples/custom-libp2p/index.js
 * https://github.com/libp2p/js-libp2p-examples/blob/1d99515341b4bc3a135b02def7db92511ffa01d2/chat/nodejs/08-End/index.js
 */
// const libp2pBundle = async (opts: any) => {
//   // const wsstar = new WebSocketStar({ id: opts.peerId })
//   console.log('*** libp2pBundle, opts:', opts.peerId.toString())

//   /**
//    * https://github.com/libp2p/js-libp2p/blob/master/doc/CONFIGURATION.md#configuring-peerstore
//    */
//   console.log('*** Creating datastore...')
//   const datastore = new LevelDatastore('ipfs/datastore')
//   await datastore.open()
//   console.log('*** Datastore created')

//   return await Libp2p.create({
//     datastore,
//     peerStore: {
//       persistence: true,
//       threshold: 5
//     },
//     addresses: {
//       listen: [
//         '/ip4/0.0.0.0/tcp/0',
//         '/ip4/0.0.0.0/tcp/0/wss',
//         `/ip4/127.0.0.1/tcp/15555/wss/p2p-webrtc-star/`,
//         '/dns4/cryptic-thicket-32566.herokuapp.com/tcp/443/wss/p2p-webrtc-star/',
//       ]
//     },
//     //@ts-ignore
//     modules: {
//       transport: [
//         TCP,
//         // wsstar,
//         WebRTCStar
//       ],
//       streamMuxer: [Mplex],
//       //@ts-ignore
//       connEncryption: [NOISE],
//       peerDiscovery: [Bootstrap, MDNS],
//       dht: KadDHT,
//       pubsub: Gossipsub

//     },
//     config: {
//       transport: {
//         [WebRTCStar.prototype[Symbol.toStringTag]]: {
//           // wrtc
//           connEncryption: [NOISE]
//         }
//       },
//       peerDiscovery: {
//         bootstrap: {
//           list: [
//             // '/ip4/0.0.0.0/tcp/0',
//             // '/ip4/0.0.0.0/tcp/0/wss',
//             // `/ip4/127.0.0.1/tcp/15555/wss/p2p-webrtc-star/`,
//             '/dns4/cryptic-thicket-32566.herokuapp.com/tcp/443/wss/p2p-webrtc-star/QmdBriFpsjqbgwHzPq3rY3n9zfer6rT8Z2s1qHobjtk4i7',
//           ]
//         }
//       },
//       dht: {
//         enabled: true,
//         //@ts-ignore\
//         randomWalk: { enabled: true }
//       },
//     }
//   })
// }

export async function createIpfsNode(): Promise<IPFS> {
  const defaultConfig = {
    libp2p: {
      // addresses: {
      //   listen: [
      //     // '/ipr7.0.0.1/tcp/15555/ws/p2p-webrtc-star/',
      //     // `/ip4/127.0.0.1/tcp/15555/wss/p2p-webrtc-star/`,
      //     // '/ip4/127.0.0.1/tcp/15555/',
      //     // '/ip4/127.0.0.1/tcp/4001/',
      //     '/dns4/cryptic-thicket-32566.herokuapp.com/tcp/443/wss/p2p-webrtc-star/',
      //   ]
      // },
      modules: {
        //@ts-ignore
        transports: [
          WebRTCStar,
          // TCP,
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
            // wrtc,
            connEncryption: [NOISE]
          },
          // TCP: {
          //   connEncryption: [NOISE]
          // }
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
      Bootstrap: [
        // '/dns4/cryptic-thicket-32566.herokuapp.com/tcp/443/wss/p2p-webrtc-star/'
      ],
      Addresses: {
        //@ts-ignore
        Swarm: [
          // '/ip4/127.0.0.1/tcp/15555/',
          // '/ip4/127.0.0.1/tcp/4001/',
          '/dns4/cryptic-thicket-32566.herokuapp.com/tcp/443/wss/p2p-webrtc-star/'
        ],
        // API: '/ip4/127.0.0.1/tcp/0',
        // Gateway: '/ip4/127.0.0.1/tcp/0'
      }
    },
    repo: process.env.NODE_ENV === 'test' ? './ipfs-test' : './ipfs',
    // repo: './ipfs',
    EXPERIMENTAL: { pubsub: true }
  }

  //@ts-ignore
  // const node = await create({
  //   ...defaultConfig,
  //   // libp2p: libp2pBundle,
  //   offline: process.env.NODE_ENV === 'test'
  // })

  const node = await create(defaultConfig)

  //@ts-ignore
  return node
}