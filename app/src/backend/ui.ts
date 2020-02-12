/**
 * @module ui
 * @description All functionality pertaining to creating the windows.
 */

import { BrowserWindow, remote } from 'electron';

import config from './config';
import { getEnv, isProduction } from './env';

const resetSession = (session: Electron.Session): Promise<void> => {
  return new Promise(resolve => {
    session.clearStorageData({}, () => {
      resolve();
    });
  });
};

/**
 * Get the OAuth URL based on the current environment.
 */
function getOAuthURL(): string {
  let client_id: string;

  if (isProduction()) {
    client_id = 'sjcloud-data-transfer-app';
  } else {
    client_id = 'sjcloud-desktop-dev';
  }

  return `https://platform.dnanexus.com/login?scope=%7B%22full%22%3A+true%7D&redirect_uri=https%3A%2F%2Flocalhost%3A4433%2Fauthcb&client_id=${client_id}`;
}

/**
 * Create a new main browser window for the application.
 *
 * @param cb Call to return the browser window.
 * @param width Width of the window.
 * @param height Height of the window.
 */
export function createWindow(
  cb: (window: BrowserWindow) => void,
  width: number = 900,
  height: number = 620,
) {
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

  cb(mainWindow);
}

/**
 * Opens an Oauth window with the appropriate URL then waits for the user
 * to log in. If the user logs in successfully, the code parameter will be
 * passed to the callback.
 *
 * @param showInternalURL Show internal (St. Jude) or external URL.
 * @param callback
 */
export async function createOAuthWindow(
  showInternalURL: boolean,
  cb: (window: BrowserWindow) => void,
  width: number = 1080,
  height: number = 960,
) {
  const loginWindow = new remote.BrowserWindow({
    width,
    height,
    frame: true,
    webPreferences: { nodeIntegration: false },
  });

  if (isProduction()) {
    const { session } = loginWindow.webContents;
    await resetSession(session);
  }

  loginWindow.webContents.on(
    'did-get-redirect-request',
    (event: Electron.Event, oldURL: string, newURL: string) => {
      const codeRegex = /https:\/\/platform.dnanexus.com\/login/g;
      const match = codeRegex.exec(newURL);
      if (match != null) {
        event.preventDefault();
        let timer = setInterval(() => {
          if (
            loginWindow.webContents.getURL() ===
            'https://platform.dnanexus.com/panx/projects'
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

  cb(loginWindow);
}
