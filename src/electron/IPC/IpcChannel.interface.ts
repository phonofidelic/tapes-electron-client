import { IpcMainEvent } from "electron";
import { AppDatabase } from "../../db/AppDatabase";
import { IpcRequest } from "./IpcRequest.interface";

export interface IpcChannel {
  name: string;

  handle(event: IpcMainEvent, request: IpcRequest, db: AppDatabase): void;
}
