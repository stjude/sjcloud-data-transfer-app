/**
 * @module utils
 * @description Contains the various utility functions used in the application.
 **/

import * as crypto from 'crypto';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

import { remote, shell } from 'electron';
import { performance } from 'perf_hooks';
import * as treeKill from 'tree-kill';

const mkdirp = require('mkdirp');

import { logging } from './logging';
import {
  SuccessCallback,
  ResultCallback,
  ErrorCallback,
  SJDTAFile,
} from './types';

export interface IByteRange {
  start: number;
  end: number;
}

export interface IFileInfo {
  name: string;
  path: string;
  size: string;
  raw_size: number;
  status: number;
  checked: boolean;
  waiting: boolean;
  started: boolean;
  finished: boolean;
}

export interface ICertificate {
  cert: string;
  private: string;
  public: string;
}

/**
 * CONSTANTS
 */

export const platform = os.platform();
export const defaultDownloadDir = path.join(os.homedir(), 'Downloads');
export const sjcloudHomeDirectory = path.join(os.homedir(), '.sjcloud');

export const byteRanges = (
  totalSize: number,
  chunkSize: number,
): IByteRange[] => {
  const n = Math.ceil(totalSize / chunkSize);
  const pieces = [];

  let i = 0;

  while (i < n - 1) {
    const start = chunkSize * i;
    const end = start + chunkSize - 1;
    pieces.push({ end, start });
    i++;
  }

  const lastStart = chunkSize * i;
  pieces.push({ end: totalSize - 1, start: lastStart });

  return pieces;
};

export const md5Sum = (
  pathname: string,
  start: number = 0,
  end: number = Infinity,
): Promise<string> => {
  return new Promise(resolve => {
    const hash = crypto.createHash('md5');
    const reader = fs.createReadStream(pathname, { start, end });

    reader.on('data', (chunk: Buffer | string | any) => {
      hash.update(chunk);
    });

    reader.on('end', () => {
      resolve(hash.digest('hex'));
    });
  });
};

/**
 * Creates the ~/.sjcloud directory if it doesn't already exist.
 * Callback takes args (error, created_dir) to determine whether this is the
 * user's first time to run the app.
 *
 * @param {SuccessCallback<boolean>} callback Returns (error, was directory created?)
 */
export function initSJCloudHome(callback: SuccessCallback<boolean>): void {
  fs.stat(sjcloudHomeDirectory, function(statErr: Error, stats: fs.Stats) {
    if (statErr || !stats) {
      mkdirp(sjcloudHomeDirectory, function(mkdirErr: Error) {
        if (mkdirErr) {
          return callback(mkdirErr, null);
        }

        return callback(null, true);
      });
    } else {
      return callback(null, false);
    }
  });
}

/**
 * Saves some contents to a file in the SJCloud directory.
 *
 * @param {string} filename name of the file.
 * @param {string} content contents of the file.
 * @param {ErrorCallback} [callback=undefined]
 */
export function saveToSJCloudFile(
  filename: string,
  content: string,
  callback: ErrorCallback,
): void {
  const dest = path.join(sjcloudHomeDirectory, filename);
  fs.writeFile(dest, content, callback);
}

/**
 * Reads a file from the SJCloud directory's contents.
 *
 * @todo Should the error case be a SuccessCallback rather than a return?
 * @param filename name of the file
 * @param callback results of the SJCloud file
 * @param defaultContent
 */
export function readSJCloudFile(
  filename: string,
  callback: ResultCallback<string>,
  defaultContent?: string,
): void {
  const dest = path.join(sjcloudHomeDirectory, filename);
  fs.readFile(dest, (err: Error, data: any) => {
    if (err) {
      if (!defaultContent) return;
    }
    callback(data ? data.toString() : defaultContent);
  });
}

/**
 * Opens a URL in the default, external browser (in other words, not inside
 * of the electron window).
 *
 * @param {string} url URL to open
 **/
export function openExternal(url: string): void {
  shell.openExternal(url);
}

/**
 * Open a file dialog that can be used to select a directory.
 *
 * @param {ResultCallback<string[]>} callback
 * @param {string} [defaultPath=undefined]
 */
export function openDirectoryDialog(
  callback: ResultCallback<string[]>,
  defaultPath?: string,
): void {
  return callback(
    remote.dialog.showOpenDialog({
      buttonLabel: 'Select',
      properties: ['openDirectory', 'createDirectory'],
      defaultPath,
    }),
  );
}

/**
 * Open a file dialog that can be used to select a file.
 *
 * @param {ResultCallback} callback
 */
export function openFileDialog(callback: ResultCallback<string[]>): void {
  return callback(
    remote.dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
    }),
  );
}

/**
 * Kills an entire process tree using a 3rd party package.
 *
 * @param {number} pid PID of the process to kill.
 */
export function killProcess(pid: number): void {
  return treeKill(pid);
}

/**
 * Returns a readable size from a raw byte count.
 *
 * Base function derived from stack overflow.
 * Credit: https://stackoverflow.com/a/14919494
 *
 * @param {number} bytes number of bytes
 * @param {boolean} [roundNumbers=false] round the output numbers
 * @param {boolean} [si=true] SI unit switch to use 1000 or 1024 as the divisor
 * @return {string} Human-readable size.
 */
export function readableFileSize(
  bytes: number,
  roundNumbers: boolean = false,
  si: boolean = true,
): string {
  if (isNaN(bytes) || bytes === 0) {
    return '0 GB';
  }

  let divisor = si ? 1000 : 1024;
  let byteCount = Math.abs(bytes);
  if (byteCount < divisor) {
    return Math.round(byteCount) + ' B';
  }

  let units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;

  do {
    byteCount /= divisor;
    ++u;
  } while (byteCount >= divisor && u < units.length - 1);

  let number = byteCount.toFixed(1);
  if (roundNumbers) {
    number = Math.round(parseFloat(number)).toString();
  }
  return number + ' ' + units[u];
}

/**
 * Return the basename and size of a file from the path.
 *
 * @param {string} filepath Path where the file resides.
 * @param {boolean} [checked=false] Whether the entry should start out checked.
 * @return {IFileInfo} object containing name and size properties.
 */
export function fileInfoFromPath(
  filepath: string,
  checked: boolean = false,
): IFileInfo {
  const name = path.basename(filepath);
  const size = fs.statSync(filepath).size;
  return {
    name,
    path: filepath,
    size: readableFileSize(size),
    raw_size: size,
    status: 0,
    checked,
    waiting: false,
    started: false,
    finished: false,
  };
}

/**
 * Reset a file object's status in Vuex.
 * @todo move to a more appropriate location.
 * @param {SJDTAFile} file File object
 */
export function resetFileStatus(file: SJDTAFile): void {
  file.status = 0;
  file.waiting = false;
  file.started = false;
  file.finished = false;
}

/**
 * Generate certificates that are valid for one day.
 *
 * @param callback Returns a string with the certificates, or error if any
 */
export function selfSigned(callback: SuccessCallback<ICertificate>): void {
  const selfsigned = require('selfsigned');
  return selfsigned.generate({}, { days: 1 }, callback);
}

/**
 * Creates a native dialog box asking if the user wants to send a bug report.
 *
 * @param {Error} err
 */
export function reportBug(err: Error): void {
  // logging.debug(err);
  remote.dialog.showMessageBox(
    {
      type: 'error',
      buttons: ['Report Bug', 'Cancel'],
      title: err.name,
      message:
        "We've encountered an error. If you'd like to help us resolve it, " +
        'file a report with a brief description of the problem ' +
        'and the following text.',
      detail: err.stack,
    },
    response => {
      if (response === 0) {
        // 'Report Bug' selected
        openExternal('https://stjude.cloud/contact');
      } else {
        // 'Cancel' selected
      }
    },
  );
}

/**
 * Utility timer class to time different parts of the application.
 */
export class Timer {
  start_time!: number;
  stop_time!: number;

  /**
   * @constructor
   */
  constructor() {}
  start(): void {
    this.start_time = performance.now();
  }

  stop(): void {
    this.stop_time = performance.now();
  }

  duration(): number {
    if (this.start_time == null || this.stop_time == null) return -1;
    return Math.round(this.stop_time - this.start_time);
  }
}
