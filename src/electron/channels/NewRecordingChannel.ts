import { promises as fs, existsSync } from 'fs';
import util from 'util';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import { randomBytes } from 'crypto';
import appRootDir from 'app-root-dir';
import * as mm from 'music-metadata';
import { getFilesFromPath } from 'web3.storage'

import {
  fpcalcPromise,
  getAcoustidResults,
  getMusicBrainzCoverArt,
} from '../utils';
import { IpcMainEvent, ipcMain } from 'electron';
import { IpcChannel } from '../IPC/IpcChannel.interface';
import { IpcRequest } from '../IPC/IpcRequest.interface';
import { Recording } from '../../common/Recording.interface';
import { RecordingSettings } from '../../common/RecordingSettings.interface';
import { AppDatabase } from '../../db/AppDatabase.interface';
import { storageService } from '../../storage';

const setStorageDir = async (folderName: string): Promise<string> => {
  const storagePath =
    process.env.NODE_ENV === 'production'
      ? path.resolve(process.resourcesPath, folderName)
      : path.resolve(folderName);

  if (!existsSync(storagePath)) {
    await fs.mkdir(storagePath);
  }
  return storagePath;
};

export class NewRecordingChannel implements IpcChannel {
  get name(): string {
    return 'recorder:start';
  }

  async handle(event: IpcMainEvent, request: IpcRequest, db: AppDatabase) {
    console.log(this.name);

    const recordingSettings: RecordingSettings = request.data.recordingSettings;
    const filename = `${randomBytes(16).toString('hex')}.${recordingSettings.format}`;
    const filePath = path.resolve(await setStorageDir('Data'), filename);

    let soxPath;
    const platform = os.platform();
    switch (platform) {
      case 'darwin':
        soxPath =
          process.env.NODE_ENV === 'production'
            ? path.resolve(process.resourcesPath, 'bin', 'sox-14.4.2-macOS')
            : (soxPath = path.resolve(
              appRootDir.get(),
              'bin',
              'sox-14.4.2-macOS'
            ));
        break;

      case 'win32':
        soxPath = path.resolve(appRootDir.get(), 'bin', 'sox-14.4.2-win32.exe');
        break;

      default:
        throw new Error(`Platform ${platform} not supported`);
    }

    console.log('*** soxPath:', soxPath);

    try {
      const sox = spawn(soxPath, [
        '-d',
        // `-t coreaudio "${recordingSettings.selectedMediaDeviceId}"`,
        '-q',
        `-c${recordingSettings.channels}`,
        `-t${recordingSettings.format}`,
        filePath,
      ]);

      sox.stdout.on('data', (data) => console.log(data.toString()));

      sox.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
      });

      sox.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
      });

      ipcMain.on('recorder:stop', async () => {
        console.log('Stopping recording.');
        sox.kill();

        /**
         * Create recording data
         */
        const fileStats = await fs.stat(filePath);

        const metadata = await mm.parseFile(filePath);
        console.log(
          'Recording metadata:',
          util.inspect(metadata, { showHidden: false, depth: null })
        );

        /**
         * Get acoustic fingerprint
         */
        let duration, fingerprint;
        try {
          const fpcalcResponse = await fpcalcPromise(filePath);
          duration = fpcalcResponse.duration;
          fingerprint = fpcalcResponse.fingerprint;
        } catch (err) {
          console.error('Could not generate acoustic fingerprint:', err);
          return event.sender.send(request.responseChannel, {
            error: new Error('Could not generate acoustic fingerprint'),
          });
        }

        /**
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

        /**
         * Upload file to IPFS
         */
        const files = await getFilesFromPath(filePath)
        const cid = await storageService.put(files as unknown as File[])

        /**
         * Create default title based on Recording count
         */
        const recordings = await db.find('recordings', {})
        const defaultTitle = `Recording #${recordings.length + 1}`;

        const recordingData: Recording = {
          location: filePath,
          filename,
          size: fileStats.size,
          duration: metadata.format.duration,
          format: recordingSettings.format,
          channels: recordingSettings.channels,
          common: metadata.common,
          title:
            acoustidResponse.data.results[0]?.recordings[0]?.title ||
            defaultTitle,
          acoustidResults: await acoustidResponse.data.results,
          cid
        };


        const docId = await db.add('recordings', recordingData)
        console.log('*** docId:', docId)

        const createdRecording = await db.findById('recordings', docId)
        /**
         * Send response to render process
         */
        console.log('createdRecording:', createdRecording);
        event.sender.send(request.responseChannel, { createdRecording });
      });
    } catch (err) {
      console.error('*** Could not spaw SoX:', err);
    }
  }
}
