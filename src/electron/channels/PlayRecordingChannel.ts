import { promises as fs, existsSync } from 'fs';
import path from 'path';
import datauri from 'datauri';

import { IpcMainEvent, ipcMain } from 'electron';
import { IpcChannel } from '../IPC/IpcChannel.interface';
import { IpcRequest } from '../IPC/IpcRequest.interface';
import { ContactsOutlined } from '@material-ui/icons';

export class PlayRecordingChannel implements IpcChannel {
  get name(): string {
    return 'storage:play';
  }

  async handle(event: IpcMainEvent, request: IpcRequest) {
    console.log(this.name);

    const { recordingLocation } = request.data;

    console.log('*** play recording, recordingLocation:', recordingLocation);

    const content = await datauri(recordingLocation);

    event.sender.send(request.responseChannel, {
      data: content,
      message: 'Data URI loaded',
    });
  }
}
