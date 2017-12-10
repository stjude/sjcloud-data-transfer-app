const os = require("os");
const path = require("path");
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
import { downloadFile, runCommandSync } from "../../bin/backend/utils";
import * as logging from "../../bin/backend/logging-remote";

let arch = os.arch();
let platform = os.platform();
if (platform === "linux") { platform = getUbuntuVersionOrNull(); }
if (!platform) throw new Error(`Unrecognized platform. Must be Windows, Mac, or Ubuntu.`);

/**
 * 
 * @param packagename 
 */
export function getDownloadInfo(packagename: string): DXDownloadInfo {
  let platformUpper = platform.toUpperCase();
  let archUpper = arch.toUpperCase();
  packagename = packagename.toUpperCase();

  if (!('DOWNLOAD_INFO' in config)) {
    return null;
  }

  if (!(packagename in config['DOWNLOAD_INFO'])) {
    return null;
  }

  if (!(platformUpper in config['DOWNLOAD_INFO'][packagename])) {
    return null;
  }

  let dlInfo = config['DOWNLOAD_INFO'][packagename][platformUpper];
  if (('IA32' in dlInfo) || ('X64' in dlInfo)) {
    if (!(archUpper in dlInfo)) return null;
    dlInfo = dlInfo[archUpper];
  }

  return dlInfo;
}

/**
 * 
 */
export function installAnaconda(
  progressCb: ProgressCallback,
  finishedCb: SuccessCallback
) {

  if (existsSync(anacondaDirectory)) {
    throw new Error("Anaconda is already installed! This method should not be called.");
  }

  const downloadInfo = getDownloadInfo("ANACONDA");
  if (!downloadInfo) throw new Error("Could not get download info for Anaconda based on your platform!");

  const downloadURL: string = downloadInfo.URL;
  const expectedDownloadHash: string = downloadInfo.SHA256SUM;

  const tmpdir = os.tmpdir();
  const basename = path.basename(downloadURL);
  let destination = path.join(tmpdir, basename);

  logging.debug("");
  logging.debug("== Installing Dependencies ==");
  logging.debug("  [*] Downloading anaconda.");
  logging.silly(`      [-] Download location: ${destination}`);
  progressCb(1, "Downloading...");
  downloadFile(downloadURL, destination, (error: any) => {
    if (error) return finishedCb(error, null);
    logging.debug("  [*] Init SJCloud home directory.");
    progressCb(30, "Installing...");
    initSJCloudHome((error, result) => {
      if (error) return finishedCb(error, null);
      logging.debug("  [*] Installing file.");
      progressCb(40, "Installing... (step 1/3)");
      let command = "";
      if (platform === "win32") {
        command = `Start-Process ${destination} -ArgumentList '/S','/AddToPath=0','RegisterPython=0','/D=${anacondaDirectory}' -Wait`
      } else {
        command = `bash ${destination} -b -p ${anacondaDirectory}`;
      }
      logging.silly(`      [-] Download location: ${anacondaDirectory}`);
      logging.silly(`      [-] Command: ${command}`);

      runCommand(command, (error, res) => {
        if (error) return finishedCb(error, null);
        logging.debug("")
        progressCb(70, "Installing... (step 2/3)");
        logging.debug("  [*] Installing DX-Toolkit.");
        runCommand(`conda create -n sjcloud python=2.7.14 -y`, (error, res) => {
          if (error) return finishedCb(error, null);
          progressCb(85, "Installing... (step 3/3)");
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
