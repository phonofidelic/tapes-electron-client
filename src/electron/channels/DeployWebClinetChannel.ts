import path from 'path';
import { promises as fs } from 'fs';
import { networkInterfaces } from 'os'
import http from 'http'
import https from 'https'
import { spawn } from 'child_process';
import appRootDir from 'app-root-dir';
import * as IPFS from 'ipfs-core'

import { IpcMainEvent } from 'electron/main';
import { IpcChannel } from '../IPC/IpcChannel.interface';
import { IpcRequest } from '../IPC/IpcRequest.interface';
import { spawnAsync } from '../utils';

export class DeployWebClientChannel implements IpcChannel {
  get name(): string {
    return 'web-clinet:deploy'
  }

  async handle(event: Electron.IpcMainEvent, request: IpcRequest) {
    const distPath = path.resolve(appRootDir.get(), 'dist')
    // const distContents = await fs.readdir(distPath)
    const indexFile = await fs.readFile(path.resolve(distPath, 'index.html'))

    const bridgeDistPath = path.resolve(appRootDir.get(), 'dist_bridge')
    const bridgeIndexFile = await fs.readFile(path.resolve(bridgeDistPath, 'index.html'))


    // let files = []
    // for await (const file of distContents) {
    //   files.push({ content: await fs.readFile(path.resolve(distPath, file)) })
    // }
    // console.log('*** files', files)

    const ipfs = await IPFS.create()
    const { cid } = await ipfs.add(indexFile)

    // for await (const result of ipfs.addAll(files, { wrapWithDirectory: true })) {
    //   console.log('*** result:', result)
    // }

    /**
     * Get local IP address
     * https://stackoverflow.com/a/8440736
     */
    const nets = networkInterfaces();
    const results = Object.create(null); // Or just '{}', an empty object

    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
          if (!results[name]) {
            results[name] = [];
          }
          results[name].push(net.address);
        }
      }
    }
    const ip = results['en0'][0]
    console.log('*** local ip address:', ip)

    /**
     * Create cert files for HTTPS server
     */
    const opensslPath = path.resolve(appRootDir.get(), 'bin', 'openssl')
    const certDirPath = path.resolve(appRootDir.get(), 'cert')
    console.log('*** certDirPath:', certDirPath)

    // try {
    //   await spawnAsync(opensslPath, ['genrsa', '-out', path.resolve(certDirPath, 'key.pem')])
    //   await spawnAsync(opensslPath, ['req', '-new', '-config', path.resolve(certDirPath, 'cert.config'), '-key', path.resolve(certDirPath, 'key.pem'), '-out', path.resolve(certDirPath, 'csr.pem')])
    //   await spawnAsync(opensslPath, ['x509', '-req', '-days', '9999', '-in', path.resolve(certDirPath, 'csr.pem'), '-signkey', path.resolve(certDirPath, 'key.pem'), '-out', path.resolve(certDirPath, 'cert.pem')])
    //   await fs.rm(path.resolve(certDirPath, 'csr.pem'))
    // } catch (err) {
    //   console.error('Could not create SSL certificates:', err)
    // }

    /**
     * Create simple https server
     * https://www.digitalocean.com/community/tutorials/how-to-create-a-web-server-in-node-js-with-the-http-module
     */
    const requestListener = async (req: any, res: any) => {
      res.setHeader('Content-Type', 'text/html')
      res.writeHead(200)
      res.end(bridgeIndexFile)
    }

    const serverOpts = {
      key: await fs.readFile(path.resolve(certDirPath, 'key.pem')),
      cert: await fs.readFile(path.resolve(certDirPath, 'cert.pem'))
    }
    const server = https.createServer(serverOpts, requestListener)
    // const server = http.createServer(requestListener)

    server.listen(0, ip, () => {
      //@ts-ignore
      const port = server.address().port
      console.log(`Server listenting on ${port}`)

      event.sender.send(request.responseChannel, {
        message: `Static web client deployed at https://ipfs.io/ipfs/${cid}`,
        url: `https://ipfs.io/ipfs/${cid}`,
        // url: `https://dweb.link/ipfs/${cid}`,
        //@ts-ignore
        localUrl: `https://${ip}:${server.address().port}`
      })
    })
  }
}