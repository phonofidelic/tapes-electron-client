/**
 * From: https://blog.logrocket.com/electron-ipc-response-request-architecture-with-typescript/
 */
import path from 'path';
import fs from 'fs/promises';
import {
  app,
  BrowserWindow,
  ipcMain,
  IpcMainEvent,
  NewWindowEvent,
  protocol,
  session,
  shell,
} from 'electron';
import installExtension, { REDUX_DEVTOOLS } from 'electron-devtools-installer';
import appRootDir from 'app-root-dir';
import { IpcChannel } from './IPC/IpcChannel.interface';
import { RecorderTray } from './RecorderTray';
import { db } from '../db/db-orbit';
import { AppDatabase } from '../db/AppDatabase.interface';

declare const MAIN_WINDOW_WEBPACK_ENTRY: any;

const METAMASK_ID = 'nkbihfbeogaeaoehlefnkodbefgpgknn';
const METAMASK_KEY =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlcgI4VVL4JUvo6hlSgeCZp9mGltZrzFvc2Asqzb1dDGO9baoYOe+QRoh27/YyVXugxni480Q/R147INhBOyQZVMhZOD5pFMVutia9MHMaZhgRXzrK3BHtNSkKLL1c5mhutQNwiLqLtFkMSGvka91LoMEC8WTI0wi4tACnJ5FyFZQYzvtqy5sXo3VS3gzfOBluLKi7BxYcaUJjNrhOIxl1xL2qgK5lDrDOLKcbaurDiwqofVtAFOL5sM3uJ6D8nOO9tG+T7hoobRFN+nxk43PHgCv4poicOv+NMZQEk3da1m/xfuzXV88NcE/YRbRLwAS82m3gsJZKc6mLqm4wZHzBwIDAQAB';

const loadMetamaskFromManifest = async (session: any, metamaskPath: string) => {
  const data = await fs.readFile(`${metamaskPath}/manifest.json`, 'utf8');

  let manifest;
  manifest = JSON.parse(data);
  manifest.content_scripts[0].matches = ['chrome://brave/**/*'];
  manifest.key = METAMASK_KEY;
  return session.defaultSession.loadExtension(
    metamaskPath,
    manifest,
    'component'
  );
};

export class Main {
  private mainWindow: BrowserWindow;

  private tray: RecorderTray;

  private metamaskPopup: BrowserWindow;

  private database: AppDatabase;

  public init(ipcChannels: IpcChannel[]) {
    app.on('ready', this.createWindow);
    app.on('window-all-closed', this.onWindowAllClosed);
    app.on('activate', this.onActivate);
    //@ts-ignore
    app.on('new-window', this.onNewWindow);

    this.registerIpcChannels(ipcChannels);

    // ipcMain.on('database:create', this.onCreateDatabase.bind(this))
    this.createDatabase()
  }

  private async createDatabase() {
    console.log('Creating database...')
    try {
      this.database = await db.init()
      console.log('Database initialized')
      // app.on('before-quit', this.database.close)
    } catch (err) {
      console.error('Could not create database:', err)
    }
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
      console.log('basename:', basename)
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

    // // const extension = await session.defaultSession.loadExtension(metaMaskPath);
    // const extension = await loadMetamaskFromManifest(session, metaMaskPath);
    // console.log('MetaMask extention loaded:', extension);

    // this.metamaskPopup = new BrowserWindow({
    //   title: 'MetaMask',
    //   width: 360,
    //   height: 520,
    //   type: 'popup',
    //   resizable: false,
    //   webPreferences: {
    //     // nodeIntegration: true, // makes it possible to use `require` within our index.html
    //     // enableRemoteModule: true, //<-- https://github.com/electron-userland/spectron/pull/738#issuecomment-754810364
    //     contextIsolation: true,
    //     preload:
    //       process.env.NODE_ENV === 'production'
    //         ? path.join(process.resourcesPath, 'preload.js')
    //         : path.join(__dirname, '..', '..', 'preload.js'),
    // },
    // });
    // this.metamaskPopup.loadURL(`chrome-extension://${METAMASK_ID}/popup.html`);
    // this.metamaskPopup.loadURL(path.resolve(metaMaskPath, 'popup.html'));

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
        channel.handle(event, request, this.database)
      )
    );

    ipcMain.on('open-metamask-popup', (event, args) => {
      console.log('*** OPEN METAMASK ***');
    });
  }
}
