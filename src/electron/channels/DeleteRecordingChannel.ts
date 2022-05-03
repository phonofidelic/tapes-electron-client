import { promises as fs } from 'fs';
import { IpcMainEvent } from 'electron';
import { IpcChannel } from '../IPC/IpcChannel.interface';
import { IpcRequest } from '../IPC/IpcRequest.interface';
import { Recording } from '../../common/Recording.interface';
import { ErrorRounded } from '@mui/icons-material';
import { AppDatabase } from '../../db/AppDatabase.interface';

export class DeleteRecordingChannel implements IpcChannel {
  get name(): string {
    return 'recordings:delete_one';
  }

  async handle(event: IpcMainEvent, request: IpcRequest, db: AppDatabase) {
    console.log(this.name, request);

    const { recording } = request.data
    // const recording = await db.findById('recordings', recordingId) as unknown as Recording;

    try {
      // await db.delete('recordings', recording._id)
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
