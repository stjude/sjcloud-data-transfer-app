/**
 * @module ipc
 * @description Handles the IPC listeners.
 */

import { ipcMain } from 'electron';
import { logging } from './logging';
import { SuccessCallback } from './types';
import { waitForCode } from './oauth';

logging.info('   [*] Registering IPC Listeners...');

ipcMain.on('sync/log-error', (event: any, arg: any) => {
  logging.error(arg);
  event.returnValue = null;
});

ipcMain.on('sync/log-warn', (event: any, arg: any) => {
  logging.warn(arg);
  event.returnValue = null;
});

ipcMain.on('sync/log-info', (event: any, arg: any) => {
  logging.info(arg);
  event.returnValue = null;
});

ipcMain.on('sync/log-debug', (event: any, arg: any) => {
  logging.debug(arg);
  event.returnValue = null;
});

ipcMain.on('sync/log-silly', (event: any, arg: any) => {
  logging.silly(arg);
  event.returnValue = null;
});

ipcMain.on(
  'oauth:request-token',
  (event: Electron.Event, showInternalURL: boolean) => {
    waitForCode(showInternalURL, (err, code) => {
      event.sender.send('oauth:receive-token', err, code);
    });
  },
);
