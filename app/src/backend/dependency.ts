const os = require("os");
const path = require("path");
const config = require("../../../config.json");
import {
  runCommand,
  getUbuntuVersionOrNull
} from "./utils";
import { DXDownloadInfo, SuccessCallback } from "./types";
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

function extractPython(
  filepath: string,
  callback: SuccessCallback,
  outputDir: string = "~/.sjcloud/Python2.7/"
) {
  const supportedExt = [".pkg"];
  let ext = path.extname(filepath);
  let parentDir = path.dirname(filepath);

  if (supportedExt.indexOf(ext) == -1) {
    return callback(new Error(`Extension '${ext}' not supported!`), null);
  }

  if (ext == ".pkg") {
    const commandLinePayload = path.join(parentDir, "Python_Framework.pkg/", "Payload");

    try {
      runCommandSync("which xar");
      runCommandSync("which gunzip");
      runCommandSync("which cpio");
      runCommandSync(`xar -xf ${filepath} -C ${parentDir}`);
      runCommandSync(`[[ -d ${outputDir} ]] || mkdir -p ${outputDir}`);
      runCommandSync(`cd ${outputDir}; cat ${commandLinePayload} | gunzip -dc | cpio -i`)
      console.log(parentDir);
    } catch (e) {
      console.error(e);
    }

    console.log("Done!");
    callback(null, true);
  }
}

/**
 * 
 */
export function installPython() {
  const downloadInfo = getDownloadInfo("PYTHON2.7");
  if (!downloadInfo) throw new Error("Could not get download info for PYTHON2.7");

  const downloadURL: string = downloadInfo.URL;
  const expectedDownloadHash: string = downloadInfo.SHA256SUM;

  const tmpdir = os.tmpdir();
  const basename = path.basename(downloadURL);
  console.log(basename);

  let destination = path.join(tmpdir, basename);
  downloadFile(downloadURL, destination, () => {
    extractPython(destination, (error, result) => {
    });
  });
}