//@ts-ignore
import OrbitDB from 'orbit-db'
import { IpcMainEvent } from 'electron';
import { AppDatabase } from "../../db/db-orbit";
import { IpcChannel } from '../IPC/IpcChannel.interface';
import { IpcRequest } from '../IPC/IpcRequest.interface';

export class CreateDatabaseChannel implements IpcChannel {
  get name(): string {
    return 'database:create';
  }

  handle(event: IpcMainEvent, request: IpcRequest) {
    console.log(this.name);

    try {
      const databaseInstance = new AppDatabase(OrbitDB)

      event.sender.send(request.responseChannel, { databaseInstance: JSON.stringify(databaseInstance) })
    } catch (err) {
      console.error('Could not create database instance:', err)
    }
  }
}