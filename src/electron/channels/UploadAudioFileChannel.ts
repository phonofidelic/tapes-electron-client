import path from 'path';
import util from 'util';
import { promises as fs } from 'fs';
import https from 'https';
import { spawn } from 'child_process';
import * as mm from 'music-metadata';
import { randomBytes } from 'crypto';
import { IpcMainEvent, ipcMain } from 'electron';
import appRootDir from 'app-root-dir';

import {
  setStorageDir,
  validRecordingFormat,
  getMusicBrainzCoverArt,
  fpcalcPromise,
  getAcoustidResults,
} from '../utils';
import { IpcChannel } from '../IPC/IpcChannel.interface';
import { IpcRequest } from '../IPC/IpcRequest.interface';
import { Recording } from '../../common/Recording.interface';
import { RecordingFormats } from '../../common/RecordingFormats.enum';
import axios from 'axios';
import { MusicBrainzCoverArt } from '../../common/MusicBrainzCoverArt.interface';

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

      /**
       * Check for metadata.common.title
       * If it is empty, start Acoustid process here
       */

      if (!metadata.common.title || !metadata.common.artist) {
        console.log('*** Not enough metadata. Starting Acoustid process...');
        // console.log('*** ACOUSTID_API_KEY:', process.env.ACOUSTID_API_KEY);

        /**
         * Get acoustic fingerprint
         */
        let duration, fingerprint;
        try {
          const fpcalcResponse = await fpcalcPromise(file.path);
          duration = fpcalcResponse.duration;
          fingerprint = fpcalcResponse.fingerprint;
        } catch (err) {
          console.error('Could not generate acoustic fingerprint:', err);
          return event.sender.send(request.responseChannel, {
            error: new Error('Could not generate acoustic fingerprint'),
          });
        }

        let acoustidResponse;
        try {
          acoustidResponse = await getAcoustidResults(duration, fingerprint);
        } catch (err) {
          console.error('Could not get Acoustid results:', err);
          return event.sender.send(request.responseChannel, {
            error: new Error('Could not get Acoustid results'),
          });
        }

        /**
         * Get cover art from MusicBrainz
         */
        const musicBrainzCoverArt = acoustidResponse.data.results.length
          ? await getMusicBrainzCoverArt(metadata.common)
          : null;

        recordings.push({
          location: filePath,
          filename,
          title:
            metadata.common.title ||
            acoustidResponse.data.results[0]?.recordings[0]?.title ||
            'No title',
          size: file.size,
          duration: metadata.format.duration,
          format,
          channels: metadata.format.numberOfChannels,
          common: metadata.common,
          fileData: await fs.readFile(filePath),
          acoustidResults: [await acoustidResponse.data.results[0]],
          musicBrainzCoverArt,
        });
      } else {
        /**
         * Get cover art from MusicBrainz
         */
        const musicBrainzCoverArt = await getMusicBrainzCoverArt(
          metadata.common
        );
        console.log('*** musicBrainzCoverArt:', musicBrainzCoverArt);

        recordings.push({
          location: filePath,
          filename,
          title: metadata.common.title || 'No title',
          size: file.size,
          duration: metadata.format.duration,
          format,
          channels: metadata.format.numberOfChannels,
          common: metadata.common,
          fileData: await fs.readFile(filePath),
          musicBrainzCoverArt,
        });
      }
    }
    event.sender.send(request.responseChannel, {
      message: 'Success!',
      data: recordings,
    });
  }
}
