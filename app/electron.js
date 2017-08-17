const electron = require("electron");
const app = electron.app;
const protocol = electron.protocol;
const menu = electron.Menu; 
const BrowserWindow = electron.BrowserWindow;

const url = require("url");
const path = require("path");
const os = require("os");
const winston = require("winston");

if (os.platform() == "darwin" || os.platform == "linux") {
  winston.add(winston.transports.File, { filename: path.join(process.env.HOME, ".sjcloud/log.txt") });
}
if (os.platform() == "win32") {
  winston.add(winston.transports.File, { filename: path.join(process.env.HOMEPATH, ".sjcloud/log.txt") });
}

let mainWindow;
winston.info(process.argv);

app.on("ready", () => {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 642, // 600px + top bar
    frame: true //false
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
