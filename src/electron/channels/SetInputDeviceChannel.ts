import { spawn } from 'child_process';
import path from 'path';
import appRootDir from 'app-root-dir';

import { IpcMainEvent } from 'electron';
import { IpcChannel } from '../IPC/IpcChannel.interface';
import { IpcRequest } from '../IPC/IpcRequest.interface';

export class SetInputDeviceChannel implements IpcChannel {
  get name(): string {
    return 'recorder:set-input';
  }

  async handle(event: IpcMainEvent, request: IpcRequest) {
    console.log(this.name);

    console.log('*** Input Device:', request.data);

    const normalizedDeviceName = /internal/i.test(request.data)
      ? 'internal'
      : request.data.replace(/ *\([^)]*\) */g, '').trim();

    console.log('*** Normalized Device Name:', normalizedDeviceName);

    /**
     * Audiodevice command:
     * http://whoshacks.blogspot.com/2009/01/change-audio-devices-via-shell-script.html
     */
    const audiodevicePath =
      process.env.NODE_ENV === 'production'
        ? path.resolve(process.resourcesPath, 'bin', 'audiodevice')
        : path.resolve(appRootDir.get(), 'bin', 'audiodevice');

    try {
      const audiodevice = spawn(audiodevicePath, [
        'input',
        `${normalizedDeviceName}`,
      ]);

      audiodevice.stdout.on('data', (data) => console.log(data.toString()));

      audiodevice.on('close', (code) => {
        console.log(`child process "audiodevice" exited with code ${code}`);
      });
    } catch (err) {
      console.error('Could not spawn audiodevice command:', err);

      event.sender.send(request.responseChannel, {
        error: `Could not set input device to "${normalizedDeviceName}"`,
      });
    }

    event.sender.send(request.responseChannel, {
      message: `Input device changed to "${normalizedDeviceName}"`,
    });
  }
}
