const electron = require("electron");
const app = electron.app;

const url = require("url");
const ui = require("./ui");
const path = require("path");
const state = require("./state");

let mainWindow;

app.on("ready", function() {
  ui.createWindow(function(mw) {
    mainWindow = mw;
    mainWindow.refreshState(); 
  });
});

app.on("window-all-closed", function() {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function() {
  if (mainWindow === null) {
    ui.createWindow(function(mw) {
      mainWindow = mw;
      mainWindow.refreshState(); 
    });
  }
});
