const os = require("os");
const path = require("path");
const { logging } = require("./logging");
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
  let archUpper = platform.toUpperCase();
  packagename = packagename.toUpperCase();

  if (!('DOWNLOAD_INFO' in config)
    || !(packagename in config['DOWNLOAD_INFO'])
    || !(platformUpper in config['DOWNLOAD_INFO'][packagename])) {
    return null;
  }

  let dlInfo = config['DOWNLOAD_INFO'][packagename][platformUpper];
  if (('IA32' in dlInfo) || ('X64' in dlInfo)) {
    if (!(arch in dlInfo)) return null;
    dlInfo = dlInfo[arch];
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
  progressCb(1, "Downloading...");
  downloadFile(downloadURL, destination, (error: any) => {
    if (error) return finishedCb(error, null);
    progressCb(30, "Installing... (step 1/4)");
    initSJCloudHome((error, result) => {
      if (error) return finishedCb(error, null);
      progressCb(40, "Installing... (step 2/4)");
      runCommand(`bash ${destination} -b -p ${anacondaDirectory}`, (error, res) => {
        if (error) return finishedCb(error, null);
        progressCb(70, "Installing... (step 3/4)");
        runCommand(`conda create -n sjcloud python=2.7.14 -y`, (error, res) => {
          if (error) return finishedCb(error, null);
          progressCb(85, "Installing... (step 4/4)");
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
