import { ipcRenderer } from 'electron';

export function error(message: string) {
  ipcRenderer.sendSync('sync/log-error', message);
}

export function warn(message: string) {
  ipcRenderer.sendSync('sync/log-warn', message);
}

export function info(message: string) {
  ipcRenderer.sendSync('sync/log-info', message);
}

export function debug(message: string) {
  ipcRenderer.sendSync('sync/log-debug', message);
}

export function silly(message: string) {
  ipcRenderer.sendSync('sync/log-silly', message);
}
