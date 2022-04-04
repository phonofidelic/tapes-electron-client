
import fs from 'fs'
import path from 'path'
import { Web3Storage } from 'web3.storage'

interface AppStorage {
  put(files: File[]): Promise<string>

  cache(cid: string, dest: string): void
}

export class Web3StorageService implements AppStorage {
  private client

  constructor() {
    this.client = new Web3Storage({ token: process.env.WEB3STORAGE_TOKEN })
  }

  async put(files: File[]) {
    return await this.client.put(files)
  }

  async cache(cid: string, dest: string) {
    const res = await this.client.get(cid)
    if (!res) throw new Error(`No response for CID ${cid}`);
    if (!res.ok) {
      throw new Error(`Failed to get ${cid} - [${res.status}] ${res.statusText}`)
    }

    for await (const entry of res.unixFsIterator()) {
      if (entry.type === 'directory') continue;

      const file = fs.createWriteStream(path.resolve(dest, entry.name))

      for await (const chunk of entry.content()) {
        file.write(Buffer.from(chunk))
      }

      file.close()
    }
  }
}


export const storageService = new Web3StorageService()