/**
 * @module ui
 * @description All functionality pertaining to creating the windows.
 */

import { getEnv } from './env';

const os = require('os');
const path = require('path');
const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;

const platform = os.platform();
const nodeEnvironment = getEnv();

const internal_url = 'https://cloud.stjude.org';
let client_id = 'sjcloud-desktop-dev';
if (nodeEnvironment === 'production') {
  client_id = 'sjcloud-data-transfer-app';
}

const oauth_url = `https://platform.dnanexus.com/login?scope=%7B%22full%22%3A+true%7D&redirect_uri=https%3A%2F%2Flocalhost%3A4433%2Fauthcb&client_id=${client_id}`;
let width = 900;
let height = 620;

if (platform === 'darwin' || platform === 'linux') {
  width = 900;
  height = 620;
} else if (platform === 'win32') {
  width = 900;
  height = 620;
}

/**
 * Create an instance of the main window.
 * @param callback
 * @todo Resolve icon path in this function.
 */
export function createWindow(callback: (window: any) => void) {
  let mainWindow = new BrowserWindow({
    width: width,
    height: height,
    useContentSize: true,
    resizable: false,
    maximizable: false,
    frame: true,
    // icon: path.join(__dirname, "assets/icons/png/64x64.png"),
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  /** Attach key libraries to window **/
  // mainWindow.$ = require("jquery");

  return callback(mainWindow);
}

/**
 *
/**
 * Opens an Oauth window with the appropriate URL then waits for the user
 * to log in. If the user logs in successfully, the code parameter will be
 * passed to the callback.
 *
 * @param showInternalURL Show internal (St. Jude) or external URL.
 * @param callback
 */
export function createOauthWindow(
  showInternalURL: boolean,
  callback: (window: any) => void,
) {
  let BrowserWindow = require('electron').remote.BrowserWindow;
  let loginWindow = new BrowserWindow({
    width: 1080,
    height: 960,
    frame: true,
    webPreferences: { nodeIntegration: false },
  });

  loginWindow.webContents.on('did-get-redirect-request', function(
    event: any,
    oldUrl: any,
    newUrl: any,
  ) {
    const match = /https:\/\/platform.dnanexus.com\/login\?code/g.exec(newUrl);
    if (match != null) {
      event.preventDefault();

      /**
       * Every 0.5 seconds, check to see if the window is redirecting to the main
       * DNAnexus platform page. When it does, pull up the OAuth screen and clear
       * the interval.
       */

      let timer = setInterval(() => {
        if (
          loginWindow.webContents.getURL() === 'https://platform.dnanexus.com/'
        ) {
          clearInterval(timer);
          loginWindow.loadURL(oauth_url);
        }
      }, 500);
    }
  });

  const url = showInternalURL ? internal_url : oauth_url;
  loginWindow.loadURL(url);
  loginWindow.show();
  return callback(loginWindow);
}
