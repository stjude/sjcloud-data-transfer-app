/**
 * @fileOverview Controls the UI
*/
const url = require("url");
const path = require("path");
const jquery = require("jquery");
const electron = require("electron");

const state = require("./state");

const BrowserWindow = electron.BrowserWindow;

module.exports.createWindow = (callback) => {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600
  });
  mainWindow.$ = jquery;

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.refreshState = () => {
    state.getState( (state) => {
      mainWindow.loadURL(
        url.format({
          pathname: path.join(
            __dirname,
            "../client/html/" + state.htmlfile
          ),
          protocol: "file:",
          slashes: true
        })
      );
    });
  };

  return callback(mainWindow);
};
