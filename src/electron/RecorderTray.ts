import { BrowserWindow, Tray, Menu } from "electron";

const APP_NAME = "Tapes"; // TODO: import from config

interface Bounds {
  x: number;
  y: number;
}

export class RecorderTray extends Tray {
  private recorderWindow: BrowserWindow;

  constructor(iconPath: string, recorderWindow: BrowserWindow) {
    super(iconPath);

    this.recorderWindow = recorderWindow;
    this.setToolTip(APP_NAME);
    this.on("click", this.handleClick);
    this.on("right-click", this.handleRightClick);
  }

  handleClick = (e: Event, bounds: Bounds) => {
    const { x, y } = bounds;
    const { width, height } = this.recorderWindow.getBounds();
    const yPos = process.platform === "darwin" ? y : y - height;

    if (this.recorderWindow.isVisible()) {
      this.recorderWindow.hide();
    } else {
      this.recorderWindow.setBounds({
        x: x - width / 2,
        y: yPos,
        width,
        height,
      });
      this.recorderWindow.show();
    }
  }

  handleRightClick = (e: Event, bounds: Bounds) => {
    const menuConfig = Menu.buildFromTemplate([{ role: "quit" }]);
    this.popUpContextMenu(menuConfig);
  }
}
