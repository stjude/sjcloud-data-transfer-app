/**
 * @file Utility functions.
 **/

import { ChildProcess } from "child_process";
import {
  SuccessCallback,
  CommandCallback,
  ResultCallback,
  ErrorCallback
} from "./types";

const os = require("os");
const fs = require("fs");
const path = require("path");
const https = require("https");
const mkdirp = require("mkdirp");
const _crypto = require("crypto");
const treeKill = require("tree-kill");
const { logging, } = require("./logging");
const { remote, shell, } = require("electron");
const { exec, spawn, execSync, spawnSync, } = require("child_process");


/*******************************************************************************
 * CONSTANTS
 ******************************************************************************/

const platform = os.platform();
export const sjcloudHomeDirectory = path.join(os.homedir(), ".sjcloud");
export const dxToolkitDirectory = path.join(sjcloudHomeDirectory, "dx-toolkit");
export const dxToolkitEnvironmentFile = path.join(dxToolkitDirectory, "environment");
export const dnanexusCLIDirectory = "C:\\Program Files (x86)\\DNAnexus CLI";
export const defaultDownloadDir = path.join(os.homedir(), "Downloads");
export const dnanexusPSscript = path.resolve(path.join(module.exports.dnanexusCLIDirectory, "dnanexus-shell.ps1"));


/*******************************************************************************
 * Creates the ~/.sjcloud directory, if it doesn't exist.
 * Callback takes args (error, created_dir) to determine
 * whether this is the user's first time to run the app.
 *
 * @param {SuccessCallback} callback
 ******************************************************************************/
export function initSJCloudHome(callback: SuccessCallback): void {
  fs.stat(sjcloudHomeDirectory, function (statErr: any, stats: any) {
    if (statErr || !stats) {
      mkdirp(sjcloudHomeDirectory, function (mkdirErr: any) {
        if (mkdirErr) { return callback(mkdirErr, null); }
        return callback(null, true);
      });
    } else {
      return callback(null, false);
    }
  });
};


/*******************************************************************************
 * Find or create the "dx-toolkit" directory in the ".sjcloud"
 * directory and return its path.
 *
 * @return {string} Path of "dx-toolkit" directory
 ******************************************************************************/
export function getDXToolkitDir(): string {
  if (!fs.existsSync(module.exports.dxToolkitDirectory)) {
    mkdirp(module.exports.dxToolkitDirectory, function (err: any) {
      if (err) { return null; }
      return module.exports.dxToolkitDirectory;
    });
  }
  return module.exports.dxToolkitDirectory;
};


/*******************************************************************************
 * Run a command on the Unix platform.
 * 
 * @param {string} cmd The command to be run.
 * @param {CommandCallback} innerCallback Callback to process the command output.
******************************************************************************/
function runCommandUnix(
  cmd: string,
  innerCallback: CommandCallback
): ChildProcess {
  if (platform !== "darwin" && platform !== "linux") {
    throw new Error(`Invalid platform for 'runCommandUnix': ${platform}`);
  }

  // fs.statSync() is only to check if the "dx" utility can be sourced.
  // If it fails rother commands can still be run.

  try {
    let stats = fs.statSync(dxToolkitEnvironmentFile);
    if (stats) { cmd = `source ${dxToolkitEnvironmentFile}; ${cmd};` }
  } catch (err) { /* ignore */ }

  cmd = `/usr/bin/env bash -c "${cmd}"`;
  logging.info(cmd);
  return exec(cmd, { shell: "/bin/bash", maxBuffer: 10000000, }, innerCallback);
}


/*******************************************************************************
 * Run a command on the Windows platform.
 * 
 * @param {string} cmd The command to be run.
 * @param {CommandCallback} innerCallback Callback to process the command output.
 ******************************************************************************/
function runCommandWindows(
  cmd: string,
  innerCallback: CommandCallback
) {
  if (platform !== "win32") {
    throw new Error(`Invalid platform for 'runCommandWindows': ${platform}`);
  }

  // fs.statSync() is only to check if the "dx" utility can be sourced.
  // If it fails rother commands can still be run.

  try {
    let stats = fs.statSync(dnanexusPSscript);
    if (stats) { cmd = `.'${dnanexusPSscript}'; ${cmd} `; }
  } catch (err) { /* ignore */ }

  const args = [
    "-NoLogo", "-InputFormat", "Text", "-NonInteractive", "-NoProfile",
    "-Command", `${cmd} `
  ];

  let p = spawn("powershell.exe", args, { stdio: "pipe", maxBuffer: 10000000 });

  let stdout = "";
  let stderr = "";

  p.stdout.on("data", function (data: any) { stdout += data.toString(); });
  p.stderr.on("data", function (data: any) { stderr += data.toString(); });
  p.on("error", function (err: any) { innerCallback(err, stdout, stderr); });
  p.on("close", function (code: any) { innerCallback(null, stdout, stderr); });

  return p;
}


/*******************************************************************************
 * Runs command based on the system.
 *
 * @param {string} cmd Text to be entered at the command line
 * @param {SuccessCallback} callback
 * @return {string}
 ******************************************************************************/
export function runCommand(
  cmd: string,
  callback: SuccessCallback
): ChildProcess {
  const innerCallback = function (err: any, stdout: string, stderr: string) {
    if (err) {
      logging.error(err);
      return callback(err, null);
    }

    if (stderr && stderr.length > 0) {
      logging.error(stderr);
      return callback(stderr, null);
    }

    // removes banner printed by dnanexus-shell.ps1 script
    if (platform === "win32" && stdout.startsWith("DNAnexus CLI initialized")) {
      stdout = stdout.split("\n").slice(4).join("\n");
    }

    return callback(null, stdout);
  };

  if (platform === "darwin" || platform === "linux") {
    return runCommandUnix(cmd, innerCallback);
  } else if (platform === "win32") {
    return runCommandWindows(cmd, innerCallback);
  } else throw new Error(`Unrecognized platform: ${platform}.`);
};


/*******************************************************************************
 * Runs a command synchronously in a UNIX environment.
 * 
 * @param {string} cmd The command to be run.
 * @return {string}
 ******************************************************************************/
export function runCommandSyncUnix(cmd: string): string {
  if (platform !== "darwin" && platform !== "linux") {
    throw new Error(`Invalid platform for 'runCommandSyncUnix': ${platform}`);
  }

  // fs.statSync() is only to check if the "dx" utility can be sourced.
  // If it fails rother commands can still be run.

  try {
    let stats = fs.statSync(dxToolkitEnvironmentFile);
    if (stats) { cmd = `source ${dxToolkitEnvironmentFile}; ${cmd};` }
  } catch (err) { /* ignore */ }

  return execSync(cmd, { shell: "/bin/bash", maxBuffer: 10000000 });
}


/*******************************************************************************
 * Runs a command synchronously in a Windows environment.
 * 
 * @param {string} cmd The command to be run.
 * @return {string}
 ******************************************************************************/
export function runCommandSyncWindows(cmd: string): string {
  if (platform !== "win32") {
    throw new Error(`Invalid platform for 'runCommandWindows': ${platform}`);
  }

  // fs.statSync() is only to check if the "dx" utility can be sourced.
  // If it fails rother commands can still be run.

  try {
    let stats = fs.statSync(dnanexusPSscript);
    if (stats) { cmd = `.'${dnanexusPSscript}'; ${cmd} `; }
  } catch (err) { /* ignore */ }

  const args = [
    "-NoLogo", "-InputFormat", "Text", "-NonInteractive", "-NoProfile",
    "-Command", `${cmd} `
  ];

  return spawnSync("powershell.exe", args, { stdio: "pipe", maxBuffer: 10000000 });
}


/*******************************************************************************
 * Runs commands on the system command line synchronously.
 *
 * @param {string} cmd The command to be run.
 * @return {string}
 ******************************************************************************/
export function runCommandSync(cmd: string): string {
  if (platform === "linux" || platform === "darwin") {
    return runCommandSyncUnix(cmd)
  } else if (platform == "win32") {
    return runCommandSyncWindows(cmd);
  } else throw new Error(`Invalid platform: ${platform}.`);
};


/*******************************************************************************
 * Determines if OpenSSL is accessible on the PATH.
 *
 * @todo Change callback to SuccessCallback
 * @param {ResultCallback} callback
 ******************************************************************************/
export function openSSLOnPath(callback: ResultCallback) {
  let innerCallback = function (err: any, res: any) { return callback(err); };

  if (platform === "linux" || platform === "darwin") {
    runCommand("which openssl", innerCallback);
  } else if (platform === "win32") {
    runCommand("get-command openssl", innerCallback);
  } else throw new Error(`Invalid platform: ${platform}.`);
};


/*******************************************************************************
 * Determines if Python 2.7.13+ is accessible on the PATH.
 *
 * @todo Change callback to SuccessCallback
 * @param {ResultCallback} callback
 ******************************************************************************/
export function pythonOnPath(callback: ResultCallback): void {
  let innerCallback = function (err: any, res: any) {

    // python versions before 3.4 print --version to stderr.
    // Command never has stdout.

    if (err.search("2.7.") === -1 || parseInt(err.slice(err.lastIndexOf(".") + 1)) < 13) {
      return callback(false);
    } else {
      return callback(true);
    }
  };

  runCommand("python --version", innerCallback);
};


/*******************************************************************************
 * Determines if dx-toolkit is accessible on the PATH.
 *
 * @param {SuccessCallback} callback
 ******************************************************************************/
export function dxToolkitOnPath(callback: SuccessCallback): void {
  if (platform === "linux" || platform === "darwin") {
    runCommand("which dx", callback);
  } else if (platform === "win32") {
    runCommand("get-command dx", callback);
  }
};


/*******************************************************************************
 * Runs a command to determine if we are logged in to DNAnexus.
 * 
 * @param {SuccessCallback} callback
 ******************************************************************************/
export function dxLoggedIn(callback: SuccessCallback): void {
  runCommand("dx whoami", callback);
};


/*******************************************************************************
 * Checks if there's at least one project the user can upload data to.
 * 
 * @param {SuccessCallback} callback
 ******************************************************************************/
export function dxCheckProjectAccess(callback: SuccessCallback): void {
  if (platform === "linux" || platform === "darwin") {
    runCommand("echo '0' | dx select --level UPLOAD", callback);
  } else if (platform === "win32") {
    runCommand("\"echo 0 | dx select --level UPLOAD\"", callback);
  }
};


/*******************************************************************************
 * Downloads a normal file. Downloading of a DXFile is in dx.js
 *
 * @param {string} url URL of download.
 * @param {string} dest Path for newly downloaded file.
 * @param {ErrorCallback} callback 
 * @see dx:downloadDxFile
 ******************************************************************************/
export function downloadFile(
  url: string,
  dest: string,
  callback: ErrorCallback
): void {
  let file = fs.createWriteStream(dest);
  let request = https.get(url, (res: any) => {
    res.pipe(file);
    file.on("finish", () => {
      file.close(callback);
    });
  });
};


/*******************************************************************************
 * Untars a file to the specified location.
 *
 * @param {string} filepath Path to TAR file.
 * @param {string} destParentDir Path to the parent directory of TAR content.
 * @param {SuccessCallback} callback
 ******************************************************************************/
export function untarTo(
  filepath: string,
  destParentDir: string,
  callback: SuccessCallback
): void {
  runCommand(`tar -C ${destParentDir} -zxf ${filepath}`, callback);
};


/*******************************************************************************
 * Computes the SHA256 sum of a given file.
 *
 * @todo No error possible in callback, the calculation needs to be checked
 *       for success.
 * @param {string} filepath Path to file being checksummed
 * @param {SuccessCallback} callback
 ******************************************************************************/
export function computeSHA256(
  filepath: string,
  callback: SuccessCallback
): void {
  let shasum = _crypto.createHash("SHA256");
  let s = fs.ReadStream(filepath);
  s.on("data", (chunk: object) => { shasum.update(chunk) });
  s.on("end", () => {
    const result = shasum.digest("hex");
    return callback(null, result);
  });
};


/*******************************************************************************
 * Opens a URL in the default, external browser (in other words, not inside
 * of the electron window).
 *
 * @param {string} url URL to open
 *****************************************************************************/
export function openExternal(url: string): void {
  shell.openExternal(url);
};


/*******************************************************************************
 * Open a file dialog that can be used to select a directory.
 *
 * @param {ResultCallback} callback
 * @param {string} [defaultPath=undefined]
 ******************************************************************************/
export function openDirectoryDialog(
  callback: ResultCallback,
  defaultPath: string = undefined
): void {
  let options = {
    buttonLabel: "Select",
    properties: ["openDirectory", "createDirectory"],
  };

  if (defaultPath !== undefined) {
    options = Object.assign(options, {
      defaultPath,
    });
  }

  callback(remote.dialog.showOpenDialog(options));
};


/*******************************************************************************
 * Open a file dialog that can be used to select a file.
 *
 * @param {ResultCallback} callback
 ******************************************************************************/
export function openFileDialog(callback: ResultCallback) {
  return callback(remote.dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
  }));
};


/*******************************************************************************
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
 ******************************************************************************/
export function readableFileSize(
  bytes: number,
  roundNumbers: boolean = false,
  divisor: number = 1000
): string {
  if (isNaN(bytes) || bytes === 0) { return "0 GB"; }

  let byteCount = Math.abs(bytes);
  if (byteCount < divisor) { return Math.round(byteCount) + " B"; }

  let units = ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let u = -1;

  do {
    byteCount /= divisor;
    ++u;
  } while (byteCount >= divisor && u < units.length - 1);

  let number = byteCount.toFixed(1);
  if (roundNumbers) { number = Math.round(parseFloat(number)).toString(); }
  return number + " " + units[u];
};


/*******************************************************************************
 * Return the basename and size of a file from the path.
 *
 * @param {string} filepath Path where the file resides.
 * @param {boolean} [checked=false] Whether the entry should start out checked.
 * @return {object} object containing name and size properties.
 ******************************************************************************/
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
};


/*******************************************************************************
 * Generate a random number between min and max.
 *
 * @param {number} min minimum number
 * @param {number} max maximum number
 * @return {number} random integer.
 ******************************************************************************/
export function randomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};


/*******************************************************************************
 * Kills an entire process tree using a 3rd party package.
 * 
 * @param {number} pid PID of the process to kill.
 ******************************************************************************/
export function killProcess(pid: number): void {
  return treeKill(pid);
};


/*******************************************************************************
 * Reset a file object's status in Vuex.
 * @todo move to a more appropriate location.
 * @param {any} file File object
 ******************************************************************************/
export function resetFileStatus(file: any): void {
  file.status = 0;
  file.waiting = false;
  file.started = false;
  file.finished = false;
  file.errored = false;
};


/*******************************************************************************
 * Saves some contents to a file in the SJCloud directory.
 * 
 * @param {string} filename name of the file.
 * @param {string} content contents of the file.
 * @param {ErrorCallback} [callback=undefined]
 ******************************************************************************/
export function saveToSJCloudFile(
  filename: string,
  content: string,
  callback: ErrorCallback = undefined
): void {
  const dest = path.join(sjcloudHomeDirectory, filename);
  fs.writeFile(dest, content, callback);
};


/*******************************************************************************
 * Reads a file from the SJCloud directory's contents.
 * 
 * @todo Should the error case be a SuccessCallback rather than a return?
 * @param filename name of the file
 * @param callback results of the SJCloud file
 * @param defaultContent 
 ******************************************************************************/
export function readSJCloudFile(
  filename: string,
  callback: ResultCallback,
  defaultContent: any = null
): void {
  const dest = path.join(sjcloudHomeDirectory, filename);
  fs.readFile(dest, (err: any, data: any) => {
    if (err) { if (!defaultContent) return; }
    callback(data ? data.toString() : defaultContent);
  });
};


/*******************************************************************************
 * Attempts to parse out the Ubuntu version. 'null' if not running Ubuntu.
 * 
 * @returns {string?}
 ******************************************************************************/
export function getUbuntuVersionOrNull(): string {
  try {
    const stdout = runCommandSync("lsb_release -ir");

    let [
      _label_distributor,
      distro,
      _label_release,
      releaseNum
    ] = stdout.split(/[\n\t]/);

    if (distro !== "Ubuntu") { return null; }
    return releaseNum.slice(0, 2) === "12" ? "ubuntu12" : "ubuntu14";
  } catch (e) { return null; }
};


/*******************************************************************************
 * Gets the appropriate tab literal character based on the platform.
 ******************************************************************************/
export function getTabLiteral() {
  if (platform === "darwin" || platform === "linux") {
    return "$'\t'";
  } else if (platform === "win32") {
    return "`t";
  } else throw new Error("Unrecognized platform: ${platform}.");
};