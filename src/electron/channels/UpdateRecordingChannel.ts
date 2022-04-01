import { IpcMainEvent } from "electron";
import { AppDatabase } from "../../db/AppDatabase.interface";
import { IpcChannel } from "../IPC/IpcChannel.interface";
import { IpcRequest } from "../IPC/IpcRequest.interface";

export class UpdateRecordingChannel implements IpcChannel {
  get name(): string {
    return 'recordings:update'
  }

  async handle(event: IpcMainEvent, request: IpcRequest, db: AppDatabase) {
    console.log(this.name);

    const updatedRecording = await db.update('recordings', request.data.recordingId, request.data.update)
    event.sender.send(request.responseChannel, { updatedRecording })
  }
}