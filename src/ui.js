const url = require("url");
const path = require("path");
const jquery = require("jquery");
const state = require("./state");
const electron = require("electron");
const BrowserWindow = electron.BrowserWindow;

module.exports.createWindow = function(callback) {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 600
  });
  mainWindow.$ = jquery;

  mainWindow.on("closed", function() {
    mainWindow = null;
  });

  mainWindow.refreshState = function () {
    state.getState(function(state) {
      mainWindow.loadURL(
        url.format({
          pathname: path.join(
            __dirname,
            "../assets/sjcloud/html/" + state.htmlfile
          ),
          protocol: "file:",
          slashes: true
        })
      );
    });
  }

  return callback(mainWindow);
};