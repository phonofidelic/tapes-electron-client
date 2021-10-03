import path from 'path';
import { promises as fs } from 'fs';
import * as mm from 'music-metadata';
import { randomBytes } from 'crypto';
import { IpcMainEvent, ipcMain } from 'electron';

import { setStorageDir, validRecordingFormat } from '../utils';
import { IpcChannel } from '../IPC/IpcChannel.interface';
import { IpcRequest } from '../IPC/IpcRequest.interface';
import { Recording } from '../../common/Recording.interface';
import { RecordingFormats } from '../../common/RecordingFormats.enum';

export class UploadAudioFileChannel implements IpcChannel {
  get name(): string {
    return 'storage:upload';
  }

  async handle(event: IpcMainEvent, request: IpcRequest) {
    console.log(this.name);

    console.log('*** Audio files:', request.data.files);
    const files = request.data.files;

    if (!files.length) {
      return event.sender.send(request.responseChannel, {
        error: new Error('No audio files detected'),
      });
    }

    let recordings: Recording[] = [];

    for await (let file of files) {
      console.log('*** file', file);

      /**
       * Copy audio file to Data dir
       */
      console.log('*** ext:', path.extname(file.path).replace(/\./g, ''));

      const preValidatedFormat = path
        .extname(file.path)
        .replace(/\./g, '')
        .trim();

      const format: RecordingFormats = validRecordingFormat(preValidatedFormat);

      const filename = `${randomBytes(16).toString('hex')}.${format}`;

      const filePath = path.resolve(await setStorageDir('Data'), filename);

      try {
        await fs.copyFile(file.path, filePath);
      } catch (err) {
        console.error('Could not copy audio file:', err);
      }

      /**
       * Get audio metadata
       */
      const metadata = await mm.parseFile(file.path);
      console.log('*** metadata:', metadata);

      recordings.push({
        location: filePath,
        filename,
        title: metadata.common.title,
        size: file.size,
        duration: metadata.format.duration,
        format,
        channels: metadata.format.numberOfChannels,
        common: metadata.common,
        fileData: await fs.readFile(filePath),
      });
    }

    event.sender.send(request.responseChannel, {
      message: 'Success!',
      data: recordings,
    });
  }
}
