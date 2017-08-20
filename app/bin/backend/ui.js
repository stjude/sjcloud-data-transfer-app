const url = require("url");
const path = require("path");
const electron = require("electron");
const BrowserWindow = electron.BrowserWindow;

module.exports.createWindow = (callback) => {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 642,
    frame: true
  });

  /** Attach key libraries to window **/
  mainWindow.$ = require('jquery');
  mainWindow.dx = require('./dx');
  mainWindow.electron = electron;
  mainWindow.protocol = require('./protocol');
  mainWindow.state = require('./state');
  mainWindow.utils = require('./utils');

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.setResizable(false);

  return callback(mainWindow);
};


module.exports.createOauthWindow = (callback) => {
	RemoteBrowserWindow = require('electron').remote.BrowserWindow;
	loginWindow = new RemoteBrowserWindow({
		width: 1080,
		height: 960,
		frame: true,
		webPreferences: {
			nodeIntegration: false
	    }
	});

	loginWindow.loadURL("https://platform.dnanexus.com/login?scope=%7B%22full%22%3A+true%7D&redirect_uri=https%3A%2F%2Flocalhost%3A4433%2Fauthcb&client_id=sjcloud-desktop-dev");
	loginWindow.show();
	return callback(loginWindow);
}
