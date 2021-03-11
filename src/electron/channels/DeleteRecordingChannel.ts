import { promises as fs } from 'fs';
import { IpcMainEvent } from 'electron';
import { IpcChannel } from '../IPC/IpcChannel.interface';
import { IpcRequest } from '../IPC/IpcRequest.interface';
import { RecordingInterface } from '../../common/Recording.interface';

export class DeleteRecordingChannel implements IpcChannel {
  get name(): string {
    return 'storage:delete_one';
  }

  async handle(event: IpcMainEvent, request: IpcRequest) {
    console.log(this.name, request);

    const recording: RecordingInterface = request.data;

    await fs.unlink(recording.location);

    event.sender.send(request.responseChannel, {
      message: 'Successful file deletion',
    });
  }
}
