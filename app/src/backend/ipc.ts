/**
 * @module ipc
 * @description Handles the IPC listeners.
 */

import { ipcMain } from 'electron';

import * as utils from './utils';
import { logging } from './logging';

logging.info('   [*] Registering IPC Listeners...');

ipcMain.on('sync/log-error', (event: Electron.Event, message: string) => {
  logging.error(message);
});

ipcMain.on('sync/log-warn', (event: Electron.Event, message: string) => {
  logging.warn(message);
});

ipcMain.on('sync/log-info', (event: Electron.Event, message: string) => {
  logging.info(message);
});

ipcMain.on('sync/log-debug', (event: Electron.Event, message: string) => {
  logging.debug(message);
});

ipcMain.on('sync/log-silly', (event: Electron.Event, message: string) => {
  logging.silly(message);
});
