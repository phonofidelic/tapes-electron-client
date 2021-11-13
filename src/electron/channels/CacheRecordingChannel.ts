import fs, { promises as fsp } from 'fs';
import path from 'path';
import https from 'https';
import axios from 'axios';
import { IpcMainEvent } from 'electron';
import { IpcChannel } from '../IPC/IpcChannel.interface';
import { IpcRequest } from '../IPC/IpcRequest.interface';
import { Recording } from '../../common/Recording.interface';
import { setStorageDir } from '../utils';

const MAX_CACHE_SIZE = 1000;
const MAX_CACHE_LENGTH = 5;

const getStorageStats = async (
  dir: string
): Promise<{ totalSize: number; oldestFile: string; filesLength: number }> => {
  const files = await fsp.readdir(dir);
  let totalSize = 0;
  let curTime = Infinity;
  let oldestFile = '';

  for (const file of files) {
    const { size, atimeMs } = fs.statSync(path.resolve(dir, file));
    totalSize += size;
    if (atimeMs < curTime) {
      oldestFile = file;
      curTime = atimeMs;
    }
  }

  return { totalSize, oldestFile, filesLength: files.length };
};

export class CacheRecordingChannel implements IpcChannel {
  get name(): string {
    return 'storage:cache_recording';
  }

  async handle(event: IpcMainEvent, request: IpcRequest) {
    console.log(this.name);

    const {
      recordingData,
      token,
    }: { recordingData: Recording; token: string } = request.data;

    console.log('*** recording.loacation:', recordingData.location);
    try {
      const storageDir = await setStorageDir('Data');
      console.log('*** storageDir:', storageDir);
      const { totalSize, oldestFile, filesLength } = await getStorageStats(
        storageDir
      );
      console.log('*** storageDir size:', totalSize);
      console.log('*** oldestFile:', oldestFile);

      const cachedRecordings = await fsp.readdir(storageDir);
      console.log('*** cachedRecordings:', cachedRecordings);

      const isCached = cachedRecordings.includes(recordingData.filename);
      console.log('*** isCached:', isCached);

      if (filesLength >= MAX_CACHE_LENGTH) {
        try {
          await fsp.rm(path.resolve(storageDir, oldestFile));
        } catch (err) {
          console.error('Could not remove oldestFile:', oldestFile);
        }
      }

      if (!isCached) {
        /**
         * Download recording to Data dir
         */
        const downloadUrl = recordingData.remoteLocation + `?token=${token}`;
        console.log('*** downloading from ', downloadUrl);
        const response = await axios({
          method: 'GET',
          url: downloadUrl,
          responseType: 'stream',
          httpsAgent: new https.Agent({
            host: 'hub.textile.io',
            port: 443,
            path: '/',
            rejectUnauthorized: false,
          }),
        });

        response.data.pipe(
          fs.createWriteStream(path.resolve(storageDir, recordingData.filename))
        );
        response.data.on('end', () => {
          console.log('*** recording cached ***');
        });
        response.data.on('error', (err: Error) => {
          console.error('*** Could not download recording:', err);
        });
      }
    } catch (err) {
      // console.log('Cache error:', err);
      event.sender.send(request.responseChannel, {
        message: err.message,
      });
    }
  }
}
