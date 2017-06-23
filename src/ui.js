const url = require("url");
const path = require("path");
const jquery = require("jquery");
const electron = require("electron");
const BrowserWindow = electron.BrowserWindow;

module.exports.createWindow = function(callback) {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600
  });
  mainWindow.$ = jquery;

  mainWindow.on("closed", function() {
    mainWindow = null;
  });

  return callback(mainWindow);
};