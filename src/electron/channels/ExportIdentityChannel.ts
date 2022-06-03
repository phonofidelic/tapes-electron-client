import { IpcMainEvent } from "electron";
import { AppDatabase } from "../../db/AppDatabase.interface";
import { IpcChannel } from "../IPC/IpcChannel.interface";
import { IpcRequest } from "../IPC/IpcRequest.interface";
import { identityService } from "../../identity";

export class ExportIdentityChannel implements IpcChannel {
  get name(): string {
    return 'identity:export'
  }

  async handle(event: Electron.IpcMainEvent, request: IpcRequest, db: AppDatabase): Promise<void> {
    const password = request.data

    await identityService.export(password)

    event.sender.send(request.responseChannel, { message: 'Done!' })
  }
}