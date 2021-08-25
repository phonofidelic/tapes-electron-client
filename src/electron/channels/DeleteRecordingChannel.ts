import { promises as fs } from 'fs';
import { IpcMainEvent } from 'electron';
import { IpcChannel } from '../IPC/IpcChannel.interface';
import { IpcRequest } from '../IPC/IpcRequest.interface';
import { Recording } from '../../common/Recording.interface';
import { ErrorRounded } from '@material-ui/icons';

export class DeleteRecordingChannel implements IpcChannel {
  get name(): string {
    return 'storage:delete_one';
  }

  async handle(event: IpcMainEvent, request: IpcRequest) {
    console.log(this.name, request);

    const recording: Recording = request.data;

    try {
      await fs.unlink(recording.location);
      event.sender.send(request.responseChannel, {
        message: 'Successful file deletion',
      });
    } catch (err) {
      event.sender.send(request.responseChannel, {
        message: err.message,
      });
    }
  }
}
