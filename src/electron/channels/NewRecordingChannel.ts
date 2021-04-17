import { promises as fs, existsSync } from 'fs';
import util from 'util';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import { randomBytes } from 'crypto';
import appRootDir from 'app-root-dir';
import * as mm from 'music-metadata';

import { IpcMainEvent, ipcMain } from 'electron';
import { IpcChannel } from '../IPC/IpcChannel.interface';
import { IpcRequest } from '../IPC/IpcRequest.interface';
import { Recording } from '../../common/Recording.interface';
import { RecordingSettings } from '../../common/RecordingSettings.interface';
import { RecordingFormats } from '../../common/RecordingFormats.enum';

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

const getRecordingType = (format: RecordingFormats) => {
  if (format === 'mp3') {
    return 'wav';
  }
  return format;
};

export class NewRecordingChannel implements IpcChannel {
  get name(): string {
    return 'recorder:start';
  }

  async handle(event: IpcMainEvent, request: IpcRequest) {
    console.log(this.name);

    // const recordingSettings: RecordingSettings = {
    //   channels: 1,
    //   format: RecordingFormats.Mp3,
    // };
    const recordingSettings: RecordingSettings = request.data;

    console.log('*** recordingSettings:', request.data);

    const filename = `${randomBytes(16).toString('hex')}.${
      recordingSettings.format
    }`;

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
        '-q',
        `-c${recordingSettings.channels}`,
        `-t${getRecordingType(recordingSettings.format)}`,
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

        const recording: Recording = {
          location: filePath,
          filename,
          size: fileStats.size,
          duration: metadata.format.duration,
          format: recordingSettings.format,
          channels: recordingSettings.channels,
        };

        const fileData = await fs.readFile(filePath);

        /**
         * Send response to render process
         */
        console.log('recording:', recording);
        event.sender.send(request.responseChannel, {
          data: recording,
          file: fileData,
        });
      });
    } catch (err) {
      console.error('*** Could not spaw SoX:', err);
    }
  }
}
