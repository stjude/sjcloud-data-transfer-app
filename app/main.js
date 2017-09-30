const os = require("os");
const url = require("url");
const path = require("path");
const winston = require("winston");
const electron = require("electron");

const app = electron.app;
const menu = electron.Menu;
const protocol = electron.protocol;

const ui = require("./bin/backend/ui");
const state = require("./bin/backend/state");
const protocolhandler = require("./bin/backend/protocol");

const config = require("../config.json");

if (config.ENVIRONMENT !== "dev") {
  console.warn("I've commented the autoupdate out to make it run. You can uncomment it.");
  console.warn("");
  // const autoupdater = require("./bin/backend/autoupdate");
}

if (os.platform() == "darwin" || os.platform == "linux") {
  winston.add(winston.transports.File, {filename: path.join(process.env.HOME, ".sjcloud/log.txt")});
}
if (os.platform() == "win32") {
  winston.add(winston.transports.File, {filename: path.join(process.env.HOMEPATH, ".sjcloud/log.txt")});
}

let mainWindow;
winston.info(process.argv);

/**
 * Performs commands to bootstrap the main window.
 * @param {*} mainWindow The window.
 */
function bootstrapWindow(mainWindow) {

  console.log("Bootstrapping new window...");

  setInterval(() => {
    if (mainWindow !== null && !mainWindow.isDestroyed() && protocolhandler.setURIprojectCmd) {
      console.log("URI project was set! Executing...");
      mainWindow.webContents.executeJavaScript("window.setCurrPath = 'upload';");
      mainWindow.webContents.executeJavaScript(protocolhandler.setURIprojectCmd); // have to wait till mainWindow is created before setting default project found in protocol.js
      protocolhandler.setURIprojectCmd = null;
    }
  }, 500);

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

    if (config.ENVIRONMENT === "prod") {
      menu.setApplicationMenu(menu.buildFromTemplate(template));
    }
  }
}

app.on("ready", () => {
  ui.createWindow( (mw) => {
    mainWindow = mw;
    bootstrapWindow(mainWindow);
  });
});

app.on("activate", () => {
  if (mainWindow === null || mainWindow.isDestroyed()) {
    mainWindow = null;
    ui.createWindow( (mw) => {
      mainWindow = mw;
      bootstrapWindow(mainWindow);
    });
  }
});

app.on("open-url", (event, url) => {
  if (mainWindow === null || mainWindow.isDestroyed()) {
    mainWindow = null;
    ui.createWindow( (mw) => {
      mainWindow = mw;
      bootstrapWindow(mainWindow);
    });
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
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
