import fs, { promises as fsp } from 'fs';
import path from 'path';
import { IpcMainEvent } from 'electron';
import { IpcChannel } from '../IPC/IpcChannel.interface';
import { IpcRequest } from '../IPC/IpcRequest.interface';
import { Recording } from '../../common/Recording.interface';
import { setStorageDir } from '../utils';
import { storageService } from '../../storage';

// const MAX_CACHE_SIZE = 1000;
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

    const { recording }: { recording: Recording } = request.data;

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

      const isCached = cachedRecordings.includes(recording.filename);
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
        if (!recording.cid) throw new Error('Recording has no CID');
        await storageService.cache(recording.cid, storageDir);

        event.sender.send(request.responseChannel, {
          message: 'Recording cached',
        });
      } else {
        event.sender.send(request.responseChannel, {
          message: 'Recording cached',
        });
      }
    } catch (err) {
      // console.log('Cache error:', err);
      event.sender.send(request.responseChannel, {
        error: err,
      });
    }
  }
}
