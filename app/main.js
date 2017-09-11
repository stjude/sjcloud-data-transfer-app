const electron = require("electron");
const app = electron.app;
const protocol = electron.protocol;
const menu = electron.Menu;

const url = require("url");
const path = require("path");
const os = require("os");
const winston = require("winston");

const ui = require("./bin/backend/ui");
const state = require("./bin/backend/state");
const protocolhandler = require("./bin/backend/protocol");
const config = require("../config.json");

if (os.platform() == "darwin" || os.platform == "linux") {
  winston.add(winston.transports.File, {filename: path.join(process.env.HOME, ".sjcloud/log.txt")});
}
if (os.platform() == "win32") {
  winston.add(winston.transports.File, {filename: path.join(process.env.HOMEPATH, ".sjcloud/log.txt")});
}

let mainWindow;
winston.info(process.argv);

app.on("ready", () => {
  ui.createWindow( (mw) => {
    mainWindow = mw;
    mainWindow.webContents.executeJavaScript(protocolhandler.setURIprojectCmd); // have to wait till mainWindow is created before setting default project found in protocol.js
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    if (config.ENVIRONMENT !== "dev") {
      let template = [{
        label: "SJCPUploader",
        submenu: [
          {label: "About SJCPUploader", selector: "orderFrontStandardAboutPanel:"},
          {type: "separator"},
          {label: "Quit", accelerator: "Command+Q", click: () => {
            app.quit(); 
          }},
        ]}, {
        label: "Edit",
        submenu: [
          {label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:"},
          {label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:"},
          {type: "separator"},
          {label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:"},
          {label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:"},
          {label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:"},
          {label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:"},
        ]},
      ];

      // menu.setApplicationMenu(menu.buildFromTemplate(template));
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    ui.createWindow( (mw) => {
      mainWindow = mw;
    });
  }
});

app.on("certificate-error", (event, webContents, url, error, certificate, callback) => {
  if (url.startsWith("https://localhost:4433/authcb?code=")) {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});