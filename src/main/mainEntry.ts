import { app, BrowserWindow } from "electron";

let mainWindow: BrowserWindow;

app.whenReady().then(() => {
  // mainWindow 被设置成一个全局变量，这样可以避免主窗口被 JavaScript 的垃圾回收器回收掉
  mainWindow = new BrowserWindow({});
  mainWindow.loadURL(process.argv[2]);
});
