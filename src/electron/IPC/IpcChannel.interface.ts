import { IpcMainEvent } from "electron";
import { IpcRequest } from "./IpcRequest.interface";

export interface IpcChannel {
  name: string;

  handle(event: IpcMainEvent, request: IpcRequest): void;
}
