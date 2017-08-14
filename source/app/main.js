/**
 * @fileOverview App entry point
*/

const os = require("os");
const url = require("url");
const path = require("path");
const winston = require("winston");
const electron = require("electron");

const ui = require("./ui");
const state = require("./state");
const protocolhandler = require("./protocol");

const app = electron.app;
const menu = electron.Menu;
const protocol = electron.protocol;

/**
 * Set up logging
 **/

 const platform = os.platform();

if (platform === "darwin" || platform === "linux") {
  winston.add(winston.transports.File, { filename: path.join(process.env.HOME, ".sjcloud/log.txt") });
} else if (platform === "win32") {
  winston.add(winston.transports.File, { filename: path.join(process.env.HOMEPATH, ".sjcloud/log.txt") });
}

let mainWindow;

app.on("ready", () => {
  ui.createWindow( (mw) => {
    mainWindow = mw;
    mainWindow.refreshState();
    var template = [{
      label: "SJCPUploader",
      submenu: [
        { label: "About SJCPUploader", selector: "orderFrontStandardAboutPanel:" },
        { type: "separator" },
        { label: "Quit", accelerator: "Command+Q", click: () => { app.quit(); }}
      ]}, {
      label: "Edit",
      submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
      ]}
    ];

	if (process.env.NODE_ENVIRONMENT !== "dev") {
		menu.setApplicationMenu(menu.buildFromTemplate(template));
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
      mainWindow.refreshState();
    });
  }
});
