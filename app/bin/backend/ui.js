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
