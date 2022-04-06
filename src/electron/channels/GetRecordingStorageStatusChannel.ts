import { IpcMainEvent } from "electron";
import { storageService } from "../../storage";
import { AppDatabase } from "../../db/AppDatabase.interface";
import { IpcChannel } from "../IPC/IpcChannel.interface";
import { IpcRequest } from "../IPC/IpcRequest.interface";

export class GetRecordingStorageStatusChannel implements IpcChannel {
  get name(): string {
    return 'storage:get_recording_stats'
  }

  async handle(event: IpcMainEvent, request: IpcRequest, db: AppDatabase) {
    const recordingCid = request.data;
    if (!recordingCid) {
      event.sender.send(request.responseChannel, { error: new Error('Recording CID is required for this request') })
    }
    try {
      const recordingStorageStatus = await storageService.status(recordingCid)
      event.sender.send(request.responseChannel, { message: 'Success', recordingStorageStatus })
    } catch (err) {
      console.error('Could not get storage stats:', err)
      event.sender.send(request.responseChannel, { error: new Error('Could not get storage stats') })
    }
  }
}