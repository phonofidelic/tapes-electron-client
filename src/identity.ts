import os from 'os'
import path from 'path'
import { createHmac } from 'crypto'
import Identities, { Identity, IdentityAsJson, IdentityProvider, IdentityProviderOptions, StaticCreateIdentityOptions } from 'orbit-db-identity-provider'
import { Keystore } from 'orbit-db-keystore'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import KeyResolver from 'key-did-resolver'
import forge from 'node-forge'
import OrbitDB from 'orbit-db';
// import migrate from 'localstorage-level-migration'

//@ts-ignore
// Identities.DIDIdentityProvider.setDIDResolver(KeyResolver.getResolver())

// var password = 'mystrongpassword';
// var md = forge.md.sha256.create();
// md.update(password);
// var seed = md.digest().data
// var ed25519 = forge.pki.ed25519;
// var keypair = ed25519.generateKeyPair({ seed: seed });

// //@ts-ignore
// // console.log('*** IdentityProvider:', OrbitDB.Identities.IdentityProvider)
// //@ts-ignore
// class TapesIdentityProvider extends OrbitDB.Identities.IdentityProvider {
//   // private password: string;
//   type: string
//   constructor(options: IdentityProviderOptions) {
//     super(options)
//     // this.password = password
//   }
//   static get type() {
//     return 'TapesIdentity'
//   }

//   async getId() {
//     return Buffer.from(keypair.publicKey).toString('hex')
//   }

//   async signIdentity(data: any, options?: { [key: string]: any; id: string }): Promise<any> {
//     const signatureBytes = ed25519.sign({
//       message: data,
//       encoding: 'utf8',
//       privateKey: keypair.privateKey
//     })

//     const signature = forge.util.bytesToHex(signatureBytes.toString())

//     return signature;
//   }

//   static async verifyIdentity(identity: IdentityAsJson): Promise<boolean> {
//     return ed25519.verify({
//       message: identity.publicKey + identity.signatures.id,
//       encoding: 'utf8',
//       signature: forge.util.hexToBytes(identity.signatures.publicKey),
//       publicKey: forge.util.hexToBytes(identity.id)
//     })
//   }
// }
export interface TapesIdentity {
  deviceInfo: {
    hostname: string,
    platform: string
  },
  databaseId: 
}

interface AppIdentity {
  create(): Promise<TapesIdentity>

  import(keyStorePath: string): Promise<Identity>

  export(password: string): Promise<void>
}

export class OrbitIdentity implements AppIdentity {
  async create() {
    let identity = {} as TapesIdentity

    identity.deviceInfo = {
      hostname: os.hostname(),
      platform: os.platform()
    }

    return identity
  }

  async import(keyStorePath: string): Promise<Identity> {
    console.log('*** importing identity...')
    const keystore = new Keystore(keyStorePath)

    const identity = await Identities.createIdentity({ id: 'tapes-test', keystore })
    console.log('*** imported identity:', identity.toJSON())

    return identity
  }

  async export(password: string = ''): Promise<void> {
    console.log('*** exporting identity...')

    /**
     * https://github.com/orbitdb/orbit-db-identity-provider#creating-an-identity-with-a-did
     * https://github.com/orbitdb/orbit-db-identity-provider/issues/54#issuecomment-1086272111
     */
    // const encoder = new TextEncoder()
    // const seed = encoder.encode('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
    // console.log('*** seed:', seed)

    // console.log('*** seed length:', seed.byteLength)

    // const didProvider = new Ed25519Provider(seed)

    // const identity = await Identities.createIdentity({ type: 'DID', didProvider })



    // //@ts-ignore
    // Identities.addIdentityProvider(TapesIdentityProvider)
    // //@ts-ignore
    // const identity = await Identities.createIdentity({ type: 'TapesIdentity', id: 'testId' })

    try {
      // const identity = await Identities.createIdentity({ id: 'tapes-id', migrate: migrate('orbitdb/keystore') })
      const identity = ''

      console.log('*** exported identity:', identity)
    } catch (err) {
      console.log('*** Export identity error:', err)
    }
  }

  getDeviceInfo() {

  }
}

export const identityService = new OrbitIdentity()
