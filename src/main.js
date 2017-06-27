const electron = require("electron");
const app = electron.app;
const protocol = electron.protocol;
const menu = electron.Menu; 

const url = require("url");
const path = require("path");
const winston = require("winston");

const ui = require("./ui");
const state = require("./state");

winston.add(winston.transports.File, { filename: path.join(process.env.HOME, '.sjcloud/log.txt') });

let mainWindow;

app.setAsDefaultProtocolClient("sjcloud");
winston.info(process.argv);

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

	menu.setApplicationMenu(menu.buildFromTemplate(template));
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
