const { ipcRenderer } = require('electron');

export function error(message: any) {
  return ipcRenderer.sendSync('sync/log-error', message);
}

export function warn(message: any) {
  return ipcRenderer.sendSync('sync/log-warn', message);
}

export function info(message: any) {
  return ipcRenderer.sendSync('sync/log-info', message);
}

export function debug(message: any) {
  return ipcRenderer.sendSync('sync/log-debug', message);
}

export function silly(message: any) {
  return ipcRenderer.sendSync('sync/log-silly', message);
}
