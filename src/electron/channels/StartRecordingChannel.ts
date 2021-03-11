import { promises as fs, existsSync } from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import { randomBytes } from 'crypto';
import appRootDir from 'app-root-dir';

import { IpcMainEvent, ipcMain } from 'electron';
import { IpcChannel } from '../IPC/IpcChannel.interface';
import { IpcRequest } from '../IPC/IpcRequest.interface';
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

export class StartRecordingChannel implements IpcChannel {
  get name(): string {
    return 'recorder:start';
  }

  async handle(event: IpcMainEvent, request: IpcRequest) {
    console.log(this.name);

    const recordingSettings: RecordingSettings = {
      channels: 1,
      type: 'wav',
      extension: RecordingFormats.Mp3,
      storageLocation: await setStorageDir('Data'),
    };

    console.log('*** recordingSettings:', recordingSettings);
    console.log('*** process.resourcesPath:', process.resourcesPath);

    const filename = randomBytes(16).toString('hex');

    const filePath = path.resolve(
      recordingSettings.storageLocation,
      `${filename}.${recordingSettings.extension}`
    );

    let soxPath;
    const platform = os.platform();
    switch (platform) {
      case 'darwin':
        // soxPath = path.resolve(appRootDir.get(), 'bin', 'sox-14.4.2-macOS');
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
        `-t${recordingSettings.type}`,
        '-t',
        'wav',
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

        const fileStats = await fs.stat(filePath);
        console.log('*** recording file stats:', fileStats);

        const recording = {
          location: filePath,
          filename,
          size: fileStats.size,
        };

        event.sender.send(request.responseChannel, { data: recording });
      });
    } catch (err) {
      console.error('*** Could not spaw SoX:', err);
    }
  }
}
