const $ = require("jquery");
const url = require('url')
const path = require('path')
const electron = require('electron')
const BrowserWindow = electron.BrowserWindow

module.exports.createWindow = function () {
  mainWindow = new BrowserWindow({width: 800, height: 600})
  mainWindow.$ = $;

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../resources/html/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}
