import { IpcRequest } from './electron/IPC/IpcRequest.interface';

/**
 * Use api setup in preload.js
 * https://github.com/electron/electron/issues/9920#issuecomment-575839738
 *
 * Adapted from:
 * https://blog.logrocket.com/electron-ipc-response-request-architecture-with-typescript/
 */
declare global {
  interface Window {
    api: {
      send(channel: string, data: any): void;
      receive(channel: string, data: any): void;
    };
  }
}

export class IpcService {
  private ipcRenderer?: {
    send(channel: string, data: any): void;
    receive(channel: string, data: any): void;
  };

  private initializeIpcRenderer() {
    if (!window || !window.api) {
      // console.log('IpcService, window:', window);
      throw new Error(`Unable to require renderer process`);
    }
    this.ipcRenderer = window.api;
  }

  public send<T>(channel: string, request: IpcRequest = {}): Promise<T> {
    // If the ipcRenderer is not available try to initialize it
    if (!this.ipcRenderer) {
      this.initializeIpcRenderer();
    }
    // If there's no responseChannel let's auto-generate it
    if (!request.responseChannel) {
      // request.responseChannel = `${channel}:response`;
      request.responseChannel = `${channel}:response:${Date.now()}`;
    }

    const ipcRenderer = this.ipcRenderer;
    ipcRenderer.send(channel, request);

    // This method returns a promise which will be resolved when the response has arrived.
    return new Promise((resolve) => {
      ipcRenderer.receive(request.responseChannel, (response: any) => {
        console.log(request.responseChannel);
        resolve(response);
      });
    });
  }
}
