import { promises as fs } from 'fs';
import { IpcMainEvent } from 'electron';
import { IpcChannel } from '../IPC/IpcChannel.interface';
import { IpcRequest } from '../IPC/IpcRequest.interface';

export class LoadRecordingsChannel implements IpcChannel {
  get name(): string {
    return 'storage:load';
  }

  async handle(event: IpcMainEvent, request: IpcRequest) {
    console.log(this.name);

    /**
     * Ignore hidden files:
     * https://stackoverflow.com/a/37030655
     */
    const files = await (await fs.readdir('Data')).filter(
      (filename) => !/(^|\/)\.[^\/\.]/g.test(filename)
    );
    console.log('*** files:', files);

    event.sender.send(request.responseChannel, { data: files });
  }
}
