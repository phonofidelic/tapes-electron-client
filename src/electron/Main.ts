/**
 * From: https://blog.logrocket.com/electron-ipc-response-request-architecture-with-typescript/
 */
import path from 'path';
import {
  app,
  BrowserWindow,
  ipcMain,
  NewWindowEvent,
  protocol,
  session,
  shell,
} from 'electron';
import installExtension, { REDUX_DEVTOOLS } from 'electron-devtools-installer';
import appRootDir from 'app-root-dir';
import { IpcChannel } from './IPC/IpcChannel.interface';
import { RecorderTray } from './RecorderTray';

declare const MAIN_WINDOW_WEBPACK_ENTRY: any;

export class Main {
  private mainWindow: BrowserWindow;

  private tray: RecorderTray;

  public init(ipcChannels: IpcChannel[]) {
    app.on('ready', this.createWindow);
    app.on('window-all-closed', this.onWindowAllClosed);
    app.on('activate', this.onActivate);
    //@ts-ignore
    app.on('new-window', this.onNewWindow);

    this.registerIpcChannels(ipcChannels);
  }

  private onWindowAllClosed() {
    console.log('*** all windows closed, quitting app');
    if (process.platform !== 'darwin') {
      app.quit();
    }
  }

  private onActivate() {
    if (!this.mainWindow) {
      this.createWindow();
    }
  }

  private onNewWindow(event: NewWindowEvent, url: string) {
    event.preventDefault();
    shell.openExternal(url);
  }

  private async createWindow() {
    protocol.registerFileProtocol('tapes', (request, callback) => {
      const url = request.url.replace('tapes://', '');
      const basename = path.basename(url);
      // console.log('basename:', basename)
      const filePath =
        process.env.NODE_ENV === 'production'
          ? path.join(process.resourcesPath, 'Data', basename)
          : path.join(app.getAppPath(), 'Data', basename);
      callback(filePath);
    });

    installExtension(REDUX_DEVTOOLS)
      .then((name) => console.log(`Added Extension:  ${name}`))
      .catch((err) => console.log('An error occurred: ', err));

    this.mainWindow = new BrowserWindow({
      width: 350,
      height: 458,
      title: 'Tapes',
      frame: false,
      resizable: false,
      show: false,
      webPreferences: {
        // nodeIntegration: true, // makes it possible to use `require` within our index.html
        // enableRemoteModule: true, //<-- https://github.com/electron-userland/spectron/pull/738#issuecomment-754810364
        contextIsolation: true,
        preload:
          process.env.NODE_ENV === 'production'
            ? path.join(process.resourcesPath, 'preload.js')
            : path.join(__dirname, '..', '..', 'preload.js'),
      },
    });

    this.mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    if (process.env.NODE_ENV === 'development') {
      console.log('*** opening devtools ***');
      this.mainWindow.webContents.openDevTools({ mode: 'detach' });
    }

    /**
     * Install Metamaask extention
     */
    // console.log('Loading MetaMask extention...');
    // const metaMaskPath =
    //   process.env.NODE_ENV === 'production'
    //     ? path.resolve(process.resourcesPath, 'bin', 'metamask')
    //     : path.resolve(appRootDir.get(), 'bin', 'metamask');

    // // const ses = this.mainWindow.webContents.session;
    // // ses.loadExtension(metaMaskPath, {
    // //   allowFileAccess: true,
    // // });
    // const extension = await session.defaultSession.loadExtension(metaMaskPath);
    // console.log('MetaMask extentino loaded:', extension);

    const iconName = 'icon@16.png';
    const iconPath =
      process.env.NODE_ENV === 'production'
        ? path.join(process.resourcesPath, iconName)
        : path.join('src', 'assets', iconName);
    // const iconPath = path.resolve(__dirname, '..', 'src', 'assets', iconName);
    console.log('*** iconPath:', iconPath);
    this.tray = new RecorderTray(iconPath, this.mainWindow);
  }

  private registerIpcChannels(ipcChannels: IpcChannel[]) {
    ipcChannels.forEach((channel) =>
      ipcMain.on(channel.name, (event, request) =>
        channel.handle(event, request)
      )
    );
  }
}
