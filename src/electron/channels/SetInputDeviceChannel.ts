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

    const normalizedDeviceName = /internal/i.test(request.data)
      ? 'internal'
      : // Matches code that appears in parenthesis after device name.
        // eg: "VIDBOX NW07 (eb1a:5188)"
        // results in "VIDBOX NW07"
        request.data.replace(/ *\([^)]*\) */g, '').trim();

    /**
     * `Audiodevice` is a command line utility for setting changing audio devices:
     * http://whoshacks.blogspot.com/2009/01/change-audio-devices-via-shell-script.html
     */
    const audiodevicePath =
      process.env.NODE_ENV === 'production'
        ? path.resolve(process.resourcesPath, 'bin', 'audiodevice')
        : path.resolve(appRootDir.get(), 'bin', 'audiodevice');

    try {
      spawn(audiodevicePath, ['input', `${normalizedDeviceName}`]);
    } catch (error) {
      // This error is thrown every time, perhaps due to permissions,
      // but the command works.
      if (error.code === 'Unknown system error -86') {
        event.sender.send(request.responseChannel, {
          message: `Input device changed to "${normalizedDeviceName}"`,
        });
      } else {
        console.error('Could not spawn audiodevice command:', error);
        event.sender.send(request.responseChannel, {
          error: new Error(
            `Could not set input device to "${normalizedDeviceName}"`
          ),
        });
      }
    }

    event.sender.send(request.responseChannel, {
      message: `Input device changed to "${normalizedDeviceName}"`,
    });
  }
}
