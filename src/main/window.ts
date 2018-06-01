/**
 * @module window
 * @description All functionality pertaining to creating the windows.
 */

import config from './config';
import * as env from './env';
import { SuccessCallback, ResultCallback } from './types';
import { BrowserWindow } from 'electron';

/**
 * Get the OAuth URL based on the current environment.
 */
function getOAuthURL(): string {
  let client_id: string;
  if (env.isProduction()) {
    client_id = 'sjcloud-data-transfer-app';
  } else {
    client_id = 'sjcloud-desktop-dev';
  }

  return `https://platform.dnanexus.com/login?scope=%7B%22full%22%3A+true%7D&redirect_uri=https%3A%2F%2Flocalhost%3A4433%2Fauthcb&client_id=${client_id}`;
}

/**
 * Create a new main browser window for the application.
 *
 * @param cb {SuccessCallback<BrowserWindow>} if successful, the browser window.
 * @param width {number} Width of the window.
 * @param height {number} Height of the window.
 */
export function createWindow(
  cb: SuccessCallback<BrowserWindow>,
  width: number = 900,
  height: number = 620,
) {
  try {
    let mainWindow: BrowserWindow | null = new BrowserWindow({
      width,
      height,
      useContentSize: true,
      resizable: false,
      maximizable: false,
      frame: true,
      show: false,
    });

    mainWindow.once('ready-to-show', () => {
      if (mainWindow) {
        mainWindow.show();
      }
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    cb(null, mainWindow);
  } catch (e) {
    cb(e, null);
  }
}

/**
 * Opens an Oauth window with the appropriate URL then waits for the user
 * to log in. If the user logs in successfully, the code parameter will be
 * passed to the callback.
 *
 * @param showInternalURL {boolean} Show internal (St. Jude) or external URL.
 * @param cb {SuccessCallback<BrowserWindow>} If successful, returns the OAuth BrowserWindow.
 * @param width {number} Width of the window.
 * @param height {number} Height of the window.
 */
export function createOAuthWindow(
  showInternalURL: boolean,
  cb: SuccessCallback<BrowserWindow>,
  width: number = 1080,
  height: number = 960,
) {
  try {
    const loginWindow = new BrowserWindow({
      width,
      height,
      frame: true,
      webPreferences: { nodeIntegration: false },
    });

    loginWindow.webContents.on(
      'did-get-redirect-request',
      (event: Electron.Event, oldURL: string, newURL: string) => {
        const codeRegex = /https:\/\/platform.dnanexus.com\/login\?code/g;
        const match = codeRegex.exec(newURL);
        if (match != null) {
          event.preventDefault();
          let timer = setInterval(() => {
            if (
              loginWindow.webContents.getURL() ===
              'https://platform.dnanexus.com/'
            ) {
              loginWindow.loadURL(getOAuthURL());
              clearInterval(timer);
            }
          }, 250);
        }
      },
    );

    const url = showInternalURL ? config.INTERNAL_LOGIN_URL : getOAuthURL();
    loginWindow.loadURL(url);
    loginWindow.show();
    cb(null, loginWindow);
  } catch (e) {
    cb(e, null);
  }
}
