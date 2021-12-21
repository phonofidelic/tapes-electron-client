import path from 'path';
import util from 'util';
import { promises as fs } from 'fs';
import https from 'https';
import { spawn } from 'child_process';
import * as mm from 'music-metadata';
import { randomBytes } from 'crypto';
import { IpcMainEvent, ipcMain } from 'electron';
import appRootDir from 'app-root-dir';

import { setStorageDir, validRecordingFormat } from '../utils';
import { IpcChannel } from '../IPC/IpcChannel.interface';
import { IpcRequest } from '../IPC/IpcRequest.interface';
import { Recording } from '../../common/Recording.interface';
import { RecordingFormats } from '../../common/RecordingFormats.enum';
import axios from 'axios';

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
       * TODO: Check for metadata.common.title
       * If it is empty, start Acoustid process here
       */

      if (!metadata.common.title || !metadata.common.artist) {
        console.log('*** Not enough metadata. Starting Acoustid process...');
        console.log('*** ACOUSTID_API_KEY:', process.env.ACOUSTID_API_KEY);

        /**
         * Get fingerprint
         */
        const fpcalcPath =
          process.env.NODE_ENV === 'production'
            ? path.resolve(process.resourcesPath, 'bin', 'fpcalc')
            : path.resolve(appRootDir.get(), 'bin', 'fpcalc');

        const fpcalc = spawn(fpcalcPath, [file.path, '-json']);

        fpcalc.stdout.on('data', async (data) => {
          // console.log(data.toString())
          const { duration, fingerprint } = JSON.parse(data.toString());
          const acoustidRequestUrl = `https://api.acoustid.org/v2/lookup?client=${
            process.env.ACOUSTID_API_KEY
          }&meta=recordings+releasegroups+compress&duration=${Math.round(
            duration
          )}&fingerprint=${fingerprint}`;

          // console.log('### REQUEST URL: \n', acoustidRequestUrl);

          let acoustidResponse;
          try {
            acoustidResponse = await axios({
              method: 'GET',
              url: acoustidRequestUrl,
              httpsAgent: new https.Agent({
                host: 'api.acoustid.org',
                port: 443,
                path: '/',
                rejectUnauthorized: false,
              }),
            });

            // console.log(
            //   '*** acoustidResponse:',
            //   util.inspect(acoustidResponse.data, true, 8, true)
            // );

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
              acoustidResults: await acoustidResponse.data.results,
            });
          } catch (err) {
            console.error('Could not retreive Acoustid respone:', err);
            return event.sender.send(request.responseChannel, {
              error: new Error('Could not retreive Acoustid respone'),
            });
          }
        });

        fpcalc.stderr.on('data', (data) => {
          console.error(`stderr: ${data}`);
          return event.sender.send(request.responseChannel, {
            error: new Error('Could not generate acoustic fingerprint'),
          });
        });

        fpcalc.on('close', (code) => {
          console.log(`child process exited with code ${code}`);
          fpcalc.kill();
        });
      } else {
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
        });
      }
    }
    event.sender.send(request.responseChannel, {
      message: 'Success!',
      data: recordings,
    });
  }
}
