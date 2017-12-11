const os = require("os");
const path = require("path");
const fs = require("fs-extra");
const config = require("../../../config.json");
import {
  runCommand,
  getUbuntuVersionOrNull,
  initSJCloudHome,
  anacondaDirectory,
  anacondaActivatePath,
  sjcloudHomeDirectory,
} from "./utils";
import { existsSync } from "fs";
import { DXDownloadInfo, SuccessCallback, ErrorCallback, ProgressCallback } from "./types";
import { downloadFile } from "../../bin/backend/utils";
import * as logging from "../../bin/backend/logging-remote";

let arch = os.arch();
let platform = os.platform();
if (platform === "linux") { platform = getUbuntuVersionOrNull(); }
if (!platform) throw new Error(`Unrecognized platform. Must be Windows, Mac, or Ubuntu.`);

/**
 * Get download information from config.json based on package name.
 * 
 * @param packagename Name of the package
 * @returns Relevant URL and SHA256 sum.
 */
export function getDownloadInfo(packagename: string): DXDownloadInfo {
  let platformUpper = platform.toUpperCase();
  let archUpper = arch.toUpperCase();
  packagename = packagename.toUpperCase();

  // Combining these made the code unreadable.
  if (!('DOWNLOAD_INFO' in config)) { return null; }
  if (!(packagename in config['DOWNLOAD_INFO'])) { return null; }
  if (!(platformUpper in config['DOWNLOAD_INFO'][packagename])) { return null; }

  let dlInfo = config['DOWNLOAD_INFO'][packagename][platformUpper];
  if (('IA32' in dlInfo) || ('X64' in dlInfo)) {
    if (!(archUpper in dlInfo)) return null;
    dlInfo = dlInfo[archUpper];
  }

  return dlInfo;
}

/**
 * Returns the install command for anaconda given a destination directory.
 * @param destination Directory to install anaconda to.
 * @returns Anaconda install command to be run.
 */
function getAnacondaInstallCommand(destination: string): string {
  let command = "";
  platform = platform.toUpperCase();

  if (platform === "WIN32") {
    command = `Start-Process ${destination} -ArgumentList '/S','/AddToPath=0','RegisterPython=0','/D=${anacondaDirectory}' -Wait`
  } else {
    command = `bash ${destination} -b -p ${anacondaDirectory}`;
  }
  return command;
}

/**
 * Install Anaconda to the correct location.
 * 
 * @param progressCb Callback to update the progress of the UI.
 * @param finishedCb Called when either an error occurs or anaconda is
 *                   successfully installed.
 * @param removeAnacondaIfExists If the anaconda folder exists and this method
 *                               is being called, it's likely that the last
 *                               install crashed midway. Should we remove any
 *                               old install attempts?
 */
export function installAnaconda(
  progressCb: ProgressCallback,
  finishedCb: SuccessCallback,
  removeAnacondaIfExists: boolean = true
) {

  if (existsSync(anacondaDirectory)) {
    logging.debug("");
    logging.debug("== Installing Dependencies ==");

    if (removeAnacondaIfExists) {
      logging.debug("  [*] Removing existing anaconda installation.");
      fs.remove(anacondaDirectory).catch((error: any) => { throw error; });
    } else {
      throw new Error("Anaconda is already installed! This method should not be called.");
    }
  }

  const downloadInfo = getDownloadInfo("ANACONDA");
  if (!downloadInfo)
    throw new Error("Could not get download info for Anaconda based on your platform!");

  const downloadURL: string = downloadInfo.URL;
  const expectedDownloadHash: string = downloadInfo.SHA256SUM;

  const tmpdir = os.tmpdir();
  const basename = path.basename(downloadURL);
  let destination = path.join(tmpdir, basename);

  logging.debug("  [*] Downloading anaconda.");
  logging.silly(`      [-] Download location: ${destination}`);
  progressCb(1, "Downloading...");
  downloadFile(downloadURL, destination, (error: any) => {
    if (error) return finishedCb(error, null);
    progressCb(30, "Installing...");
    initSJCloudHome((error, result) => {
      if (error) return finishedCb(error, null);
      logging.debug("  [*] Installing anaconda.");
      progressCb(25, "Installing...");
      const command = getAnacondaInstallCommand(destination);
      logging.silly(`      [-] Download location: ${anacondaDirectory}`);
      logging.silly(`      [-] Command: ${command}`);

      runCommand(command, (error, res) => {
        if (error) return finishedCb(error, null);
        logging.debug("")
        progressCb(60, "Installing...");
        logging.debug("  [*] Seeding anaconda environment.");
        runCommand(`conda create -n sjcloud python=2.7.14 -y`, (error, res) => {
          if (error) return finishedCb(error, null);
          logging.debug("Installing DX-Toolkit.");
          progressCb(95, "Installing...");
          runCommand("pip install dxpy", (error, result) => {
            if (error) return finishedCb(error, null);
            progressCb(100, "Finished!");
            return finishedCb(null, true);
          });
        })
      }, false);
    });
  });
}
