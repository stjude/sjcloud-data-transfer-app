const electron = require('electron')
const app = electron.app

const sjui = require('./ui');
const sjutils = require('./utils');
const dx = require('./dx-toolkit');

let mainWindow


app.on('ready', function() {
	sjui.createWindow()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    sjui.createWindow()
  }
})

