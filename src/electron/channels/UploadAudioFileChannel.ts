import path from 'path';
import util from 'util';
import { promises as fs } from 'fs';
import * as mm from 'music-metadata';
import { randomBytes } from 'crypto';
import { IpcMainEvent } from 'electron';
import { getFilesFromPath } from 'web3.storage';

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
import { storageService } from '../../storage';

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

    const recordings: Recording[] = [];

    for await (const file of files) {
      console.log('*** file', file);

      /*
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

      /*
       * Upload file to IPFS
       */
      const files = await getFilesFromPath(filePath);
      const cid = await storageService.put(files as unknown as File[]);

      /*
       * Get audio metadata,
       * Destructure "picture" from metadata.common and exclude it from
       * recordingData since Buffer does not seem to be supported by orbitDB.
       */
      const metadata = await mm.parseFile(filePath);
      const { picture, ...common } = metadata.common;
      console.log('*** metadata:', util.inspect(metadata, true, 8, true));

      /*
       * Attempt to get cover art from MusicBrainz.
       * Don't throw an error if unsuccessful.
       */
      let musicBrainzCoverArt;
      try {
        musicBrainzCoverArt = await getMusicBrainzCoverArt(metadata.common);
      } catch (err) {
        console.error(err);
      }

      /*
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

      /*
       * Get Acoustid results
       */
      let acoustidResponse;
      try {
        acoustidResponse = await getAcoustidResults(duration, fingerprint);
      } catch (err) {
        console.error('Could not get Acoustid results:', err);
        return event.sender.send(request.responseChannel, {
          error: new Error('Could not get Acoustid results'),
        });
      }

      const recordingData: Recording = {
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
        common,
        cid,
        acoustidResults: [await acoustidResponse.data.results[0]],
        musicBrainzCoverArt: musicBrainzCoverArt ?? null,
      };

      recordings.push(recordingData);
    }
    event.sender.send(request.responseChannel, {
      message: 'Success!',
      data: recordings,
    });
  }
}
