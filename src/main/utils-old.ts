/**
 * @module utils
 * @description Contains the various utility functions used in the application.
 **/

import { performance } from 'perf_hooks';

import { ChildProcess } from 'child_process';
import powershell from './powershell';
import {
  SuccessCallback,
  CommandCallback,
  ResultCallback,
  ErrorCallback,
} from './types';

const os = require('os');
const fs = require('fs');
const path = require('path');
const https = require('https');
const mkdirp = require('mkdirp');
const crypto = require('crypto');
const treeKill = require('tree-kill');

const { logging } = require('./logging');
const { remote, shell } = require('electron');
const { exec } = require('child_process');

/**
 * CONSTANTS
 */

export const platform = os.platform();
export const defaultDownloadDir = path.join(os.homedir(), 'Downloads');

interface StJudeCloudPaths {
  SJCLOUD_HOME?: string;
}

/**
 * Returns the various paths for the SJ Cloud home directory.
 *
 * @param sjcloudHomeDirectory SJ Cloud home path saved in the application, if any
 * @param thePlatform Platform the application is running on
 */
export function getSJCloudPaths(
  sjcloudHomeDirectory: string = null,
  thePlatform: string = platform,
): StJudeCloudPaths {
  let result: StJudeCloudPaths = {};

  if (!sjcloudHomeDirectory) {
    sjcloudHomeDirectory = path.join(os.homedir(), '.sjcloud');
  }

  result.SJCLOUD_HOME = sjcloudHomeDirectory;
  result.ANACONDA_HOME = path.join(sjcloudHomeDirectory, 'anaconda');
  result.ANACONDA_BIN =
    thePlatform === 'win32'
      ? path.join(result.ANACONDA_HOME, 'Scripts')
      : path.join(result.ANACONDA_HOME, 'bin');
  result.ANACONDA_SJCLOUD_ENV = path.join(
    result.ANACONDA_HOME,
    'envs',
    'sjcloud',
  );
  result.ANACONDA_SJCLOUD_BIN = path.join(result.ANACONDA_SJCLOUD_ENV, 'bin');

  return result;
}

/**
 * Checks if given path exists in the list of SJ Cloud paths.
 *
 * @param pathProperName The path to lookup
 * @param sjcloudHomeDirectory The SJ Cloud paths
 */
export function lookupPath(
  pathProperName: string,
  sjcloudHomeDirectory: string = null,
): string {
  const paths = getSJCloudPaths(sjcloudHomeDirectory);
  return pathProperName in paths ? (paths as any)[pathProperName] : null;
}

/**
 * Creates the ~/.sjcloud directory if it doesn't already exist.
 * Callback takes args (error, created_dir) to determine whether this is the
 * user's first time to run the app.
 *
 * @param {SuccessCallback} callback Returns (error, was directory created?)
 * @param {string?} directory Directory for SJCloud home if not default.
 */
export function initSJCloudHome(
  callback: SuccessCallback,
  sjcloudHomeDirectory: string = null,
): void {
  sjcloudHomeDirectory = lookupPath('SJCLOUD_HOME', sjcloudHomeDirectory);
  fs.stat(sjcloudHomeDirectory, function(statErr: any, stats: any) {
    if (statErr || !stats) {
      mkdirp(sjcloudHomeDirectory, function(mkdirErr: any) {
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
 * Return the boostrapping command on a UNIX machine. This will inject the
 * correct binaries on the PATH based on what has been successfully installed
 * up until this point.
 *
 * @returns {string} A command with the correct sources and PATH variable.
 */
function unixBootstrapCommand(): string {
  let paths = [];
  return paths.length != 0 ? `export PATH="${paths.join(':')}:$PATH";` : null;
}

/**
 * Return the boostrapping command on a Windows machine. This will inject the
 * correct binaries on the PATH based on what has been successfully installed
 * up until this point.
 *
 * @returns {string} A command with the correct sources and PATH variable.
 */
function windowsBootstrapCommand(): string {
  let paths = [];

  try {
    let stats = fs.statSync(lookupPath('ANACONDA_BIN'));
    if (stats) {
      paths.push(lookupPath('ANACONDA_BIN'));
    }
  } catch (err) {
    /* ignore */
  }

  try {
    let stats = fs.statSync(lookupPath('ANACONDA_SJCLOUD_ENV'));
    if (stats) {
      paths.push(lookupPath('ANACONDA_SJCLOUD_ENV'));
    }
  } catch (err) {
    /* ignore */
  }

  return paths.length != 0
    ? `$ENV:PATH="${paths.join(';')};"+$ENV:PATH;`
    : null;
}

/**
 * Run a command on the Unix platform.
 *
 * @param {string} cmd The command to be run.
 * @param {CommandCallback} innerCallback Callback to process the command output.
 */
function runCommandUnix(
  cmd: string,
  innerCallback: CommandCallback,
): ChildProcess {
  if (platform !== 'darwin' && platform !== 'linux') {
    throw new Error(`Invalid platform for 'runCommandUnix': ${platform}`);
  }

  let bootstrapCommand = unixBootstrapCommand();
  if (bootstrapCommand) {
    cmd = `${bootstrapCommand} ${cmd}`;
  }

  cmd = `/usr/bin/env bash -c '${cmd}'`;
  logging.silly(cmd);
  return exec(cmd, { maxBuffer: 10000000 }, innerCallback);
}

/**
 * Run a command on the Windows platform.
 *
 * @param {string} cmd The command to be run.
 * @param {CommandCallback} innerCallback Callback to process the command output.
 */
function runCommandWindows(
  cmd: string,
  innerCallback: CommandCallback,
): ChildProcess {
  if (platform !== 'win32') {
    throw new Error(`Invalid platform for 'runCommandWindows': ${platform}`);
  }

  const bootstrapCommand = windowsBootstrapCommand() || '';
  cmd = `${bootstrapCommand}; ${cmd}`;

  logging.silly(cmd);

  return powershell(cmd, innerCallback);
}

/**
 * Runs command based on the system.
 *
 * @param {string} cmd Text to be entered at the command line
 * @param {SuccessCallback} callback
 * @param {boolean} [raiseOnStderr=true] Raise an error if we see anything on stderr.
 * @return {string}
 */
export function runCommand(
  cmd: string,
  callback: SuccessCallback,
  raiseOnStderr: boolean = true,
): ChildProcess {
  const innerCallback = function(err: any, stdout: string, stderr: string) {
    if (err) {
      logging.error(err);
      return callback(err, null);
    }

    if (raiseOnStderr && stderr && stderr.length > 0) {
      logging.error(stderr);
      return callback(stderr, null);
    }

    if (stdout.trim() === 'False') {
      /** Powershell sometimes just returns False */
      return callback(new Error('STDOUT was False'), null);
    }

    return callback(null, stdout);
  };

  if (platform === 'darwin' || platform === 'linux') {
    return runCommandUnix(cmd, innerCallback);
  } else if (platform === 'win32') {
    return runCommandWindows(cmd, innerCallback);
  } else throw new Error(`Unrecognized platform: ${platform}.`);
}

/**
 * Opens a URL in the default, external browser (in other words, not inside
 * of the electron window).
 *
 * @param {string} url URL to open
 *****************************************************************************/
export function openExternal(url: string): void {
  shell.openExternal(url);
}

/**
 * Open a file dialog that can be used to select a directory.
 *
 * @param {ResultCallback} callback
 * @param {string} [defaultPath=undefined]
 */
export function openDirectoryDialog(
  callback: ResultCallback,
  defaultPath: string = null,
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
export function openFileDialog(callback: ResultCallback) {
  return callback(
    remote.dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
    }),
  );
}

/**
 * Returns a readable size from a raw byte count.
 *
 * Base function derived from stack overflow.
 * Credit: https://stackoverflow.com/a/14919494
 *
 * @param {number} bytes number of bytes
 * @param {boolean} [roundNumbers=false] round the output numbers
 * @param {number} [divisor=1000] how many bytes are in one 'unit'? Usually,
 *                                this is 1000 or 1024.
 * @return {string} Human-readable size.
 */
export function readableFileSize(
  bytes: number,
  roundNumbers: boolean = false,
  divisor: number = 1000,
): string {
  if (isNaN(bytes) || bytes === 0) {
    return '0 GB';
  }

  let byteCount = Math.abs(bytes);
  if (byteCount < divisor) {
    return Math.round(byteCount) + ' B';
  }

  let units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
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
 * @return {object} object containing name and size properties.
 */
export function fileInfoFromPath(
  filepath: string,
  checked: boolean = false,
): object {
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
 * Kills an entire process tree using a 3rd party package.
 *
 * @param {number} pid PID of the process to kill.
 */
export function killProcess(pid: number): void {
  return treeKill(pid);
}

/**
 * Reset a file object's status in Vuex.
 * @todo move to a more appropriate location.
 * @param {any} file File object
 */
export function resetFileStatus(file: any): void {
  file.status = 0;
  file.waiting = false;
  file.started = false;
  file.finished = false;
  file.errored = false;
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
  callback: ErrorCallback = undefined,
): void {
  const dest = path.join(lookupPath('SJCLOUD_HOME'), filename);
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
  callback: ResultCallback,
  defaultContent: any = null,
): void {
  const dest = path.join(lookupPath('SJCLOUD_HOME'), filename);
  fs.readFile(dest, (err: any, data: any) => {
    if (err) {
      if (!defaultContent) return;
    }
    callback(data ? data.toString() : defaultContent);
  });
}

export function selfSigned(callback: SuccessCallback) {
  const selfsigned = require('selfsigned');
  return selfsigned.generate({}, { days: 1 }, callback);
}

/**
 * Utility timer class to time different parts of the application.
 */
export class Timer {
  start_time: number;
  stop_time: number;

  /**
   * @constructor
   */
  constructor() {}
  start() {
    this.start_time = performance.now();
  }

  stop() {
    this.stop_time = performance.now();
  }

  duration() {
    if (this.start_time == null && this.stop_time == null) return -1;
    return Math.round(this.stop_time - this.start_time);
  }
}

/**
 * Creates a native dialog box asking if the user wants to send a bug report.
 *
 * @param {Error} err
 */
export function reportBug(err: Error) {
  logging.debug(err);
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

export interface IByteRange {
  start: number;
  end: number;
}

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
