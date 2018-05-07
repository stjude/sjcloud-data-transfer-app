/**
 * @module ipc
 * @description Handles the IPC listeners.
 */

import * as utils from './utils';
import {ipcMain} from 'electron';
import {logging} from './logging';

logging.info('   [*] Registering IPC Listeners...');

ipcMain.on('sync/generate-selfsigned', (event: any, arg: any) => {
  utils.selfSigned((err: any, certs: any) => {
    event.returnValue = certs;
  });
});

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
