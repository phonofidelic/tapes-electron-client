import { IpcMainEvent } from "electron";
import { AppDatabase } from "../../db/AppDatabase.interface";
import { IpcChannel } from "../IPC/IpcChannel.interface";
import { IpcRequest } from "../IPC/IpcRequest.interface";

export class LoadRecordingsChannel implements IpcChannel {
  get name(): string {
    return 'recordings:get_all'
  }

  async handle(event: IpcMainEvent, request: IpcRequest, db: AppDatabase) {
    const recordings = await db.find('recordings', {})

    event.sender.send(request.responseChannel, { recordings })
  }
}