/**
 * @fileOverview Methods for installing dx-toolkit and interacting with DNAnexus.
 **/

const fs = require("fs");
const os = require("os");
const path = require("path");
const utils = require("./utils");
const logging = require("./logging");
const child_process = require("child_process"); // eslint-disable-line
const expandHomeDir = require("expand-home-dir");

const config = require("../../../config.json");
/**
 * Returns the URL of the dx-toolkit download for the platform the
 * app is running on. The only platforms supported are Mac, Windows,
 * and Linux. Unknown platform case handled in state.js.
 *
 * @see state.js
 * @param {string} platform The platform the app is running on.
 * @return {string} URL of download
*/
function getDxDownloadUrlFromPlatform(platform) {
  if (platform == "darwin") {
    return config.DOWNLOAD_INFO.MAC.URL;
  } else if (platform == "ubuntu12") {
    return config.DOWNLOAD_INFO.UBUNTU_12.URL;
  } else if (platform == "ubuntu14") {
    return config.DOWNLOAD_INFO.UBUNTU_14.URL;
  } else if (platform == "win32") {
    return config.DOWNLOAD_INFO.WINDOWS.URL;
  } else throw new Error("Invalid platform: " + platform);
}

/**
 * Returns the SHA256 sum of the dx-toolkit download for the platform the app is running on.
 * The only platforms supported are Mac, Windows, and Linux. Unknown platform case handled in state.js.
 *
 * @see state.js
 * @param {string} platform The platform the app is running on.
 * @return {string} SHA256 sum of download
*/
function getSha256sumFromPlatform(platform) {
  if (platform == "darwin") {
    return config.DOWNLOAD_INFO.MAC.SHA256SUM;
  } else if (platform == "ubuntu12") {
    return config.DOWNLOAD_INFO.UBUNTU_12.SHA256SUM;
  } else if (platform == "ubuntu14") {
    return config.DOWNLOAD_INFO.UBUNTU_14.SHA256SUM;
  } else if (platform == "win32") {
    return config.DOWNLOAD_INFO.WINDOWS.SHA256SUM;
  } else throw new Config("Invalid platform: " + platform);
}

function getLinuxVers(callback) {
  utils.runCommand("lsb_release -ir", (err, stdout) => {
    if (err) {
      return callback("unrecognized");
    } else {
      [junk1, distro, junk2, releaseNum] = stdout.split(/[\n\t]/);
      if (distro != "Ubuntu") {
        return callback("unrecognized");
      } else {
        if (releaseNum.slice(0, 2) == "14") {
          return callback("ubuntu14");
        } else {
          return callback("ubuntu12"); // defaults to the ubuntu12.04 dx-toolkit release
        }
      }
    }
  });
}

/**
 * Installs the dx-toolkit.
 *
 * @param {function} updateProgress Function that updates on-screen progress bar.
 * @param {function} failProgress Function that displays failure message on progress bar.
 * @param {function} callback Callback function.
*/
module.exports.install = (updateProgress, failProgress, callback) => {
  const tmpdir = os.tmpdir();
  const platform = os.platform();
  let downloadULR;

  if (platform === "darwin") {
    downloadURL = getDxDownloadUrlFromPlatform(platform);
    const dxFolderPath = utils.getDXToolkitDir();
    const dxTarDownloadPath = path.join(tmpdir, "dx-toolkit.tar.gz");
    updateProgress("30%", "Downloading...");
    utils.downloadFile(downloadURL, dxTarDownloadPath, () => {
      // TODO(clay): handle download failure.
      updateProgress("60%", "Verifying...");
      // NOTE: I unzip to the parent directory because the unzip creates a
      // structure like dx-toolkit/dx-toolkit/...
      utils.computeSHA256(dxTarDownloadPath, (err, shasum) => {
        if (err) {
          failProgress("Could not verify download!");
          return callback(err, null);
        }
        if (getSha256sumFromPlatform(platform) != shasum) {
          failProgress("Could not verify download!");
          return callback("SHA sum doesn't match!", null);
        }
        updateProgress("90%", "Extracting...");
        const parentDir = path.dirname(dxFolderPath);
        utils.untarTo(dxTarDownloadPath, parentDir, function(err, res) {
          if (err) {
            failProgress("Could not extract dx-toolkit!");
            return callback(err, false);
          }
          updateProgress("100%", "Success!");
          return callback(null, true);
        });
      });
    });
  } else if (platform === "linux") {
    getLinuxVers((linux_vers) => {
      downloadURL = getDxDownloadUrlFromPlatform(linux_vers);
      const dxFolderPath = utils.getDXToolkitDir();
      const dxTarDownloadPath = path.join(tmpdir, "dx-toolkit.tar.gz");
      updateProgress("30%", "Downloading...");
      utils.downloadFile(downloadURL, dxTarDownloadPath, () => {
        // TODO(clay): handle download failure.
        updateProgress("60%", "Verifying...");
        // NOTE: I unzip to the parent directory because the unzip creates a
        // structure like dx-toolkit/dx-toolkit/...
        utils.computeSHA256(dxTarDownloadPath, (err, shasum) => {
          if (err) {
            failProgress("Could not verify download!");
            return callback(err, null);
          }
          if (getSha256sumFromPlatform(linux_vers) != shasum) {
            failProgress("Could not verify download!");
            return callback("SHA sum doesn't match!", null);
          }
          updateProgress("90%", "Extracting...");
          const parentDir = path.dirname(dxFolderPath);
          utils.untarTo(dxTarDownloadPath, parentDir, function(err, res) {
            if (err) {
              failProgress("Could not extract dx-toolkit!");
              return callback(err, false);
            }
            updateProgress("100%", "Success!");
            return callback(null, true);
          });
        });
      });
    });
  } else if (platform == "win32") {
    const dxExePath = path.join(utils.getDXToolkitDir(), "dx-toolkit.exe");
    updateProgress("30%", "Downloading dx-toolkit...");
    utils.downloadFile(downloadURL, dxExePath, () => {
      // TODO(clay): handle download error.
      updateProgress("60%", "Verifying dx-toolkit...");
      utils.computeSHA256(dxExePath, (err, shasum) => {
        if (err) {
          failProgress("Could not verify download!");
          return callback(err, null);
        }
        if (getSha256sumFromPlatform(platform) != shasum) {
          failProgress("Could not verify download!");
          return callback("SHA sum doesn't match!", null);
        }
        updateProgress("90%", "Installing dx-toolkit...");
        child_process.execSync(dxExePath);
        updateProgress("100%", "Success!");
        return callback(null, true);
      });
    });
  }
};

/**
 * Login to DNAnexus using an authentication token.
 *
 * @param {string} token Authentication token
 * @param {callback} callback
*/
module.exports.login = (token, callback) => {
  const cmd = "dx login --token " + token.toString() + " --noprojects";
  utils.runCommand(cmd, callback);
};

/**
 * Logout of DNAnexus.
 *
 * @param {callback} callback
*/
module.exports.logout = (callback) => {
  const cmd = "dx logout";
  utils.runCommand(cmd, callback);
};


/**
 * Find and return projects the user can upload data to.
 *
 * @param {boolean} allProjects should we limit to St. Jude Cloud
 *                  projects or list all projects?
 * @param {callback} callback
*/
module.exports.listProjects = (allProjects, callback) => {
  let tabliteral;
  const platform = os.platform();

  if (platform === "darwin" || platform === "linux") {
    tabliteral = "$'\t'";
  } else if (platform === "win32") {
    tabliteral = "`t";
  }

  // Search for tool projects.
  let basecmd = "dx find projects --level UPLOAD --delim " + tabliteral;
  let cmd = basecmd;
  if (!allProjects) { cmd += " --tag " + config.TOOL_PROJECT_TAG; }

  utils.runCommand(cmd, (err, stdout) => {
    let results = [];

    if (err) {
      return callback(err, []);
    }

    stdout.split("\n").forEach( (el) => {
      if (el.trim().length <= 0) return;
      [dxLocation, name, accessLevel, _] = el.split("\t");
      if (accessLevel) {
        results.push({
          project_name: name,
          dx_location: dxLocation,
          access_level: accessLevel,
        });
      }
    });

    if (!allProjects) {
      cmd = basecmd + " --tag " + config.DATA_PROJECT_TAG;
      utils.runCommand(cmd, (err, stdout) => {
        if (err) {
          return callback(err, results);
        }

        stdout.split("\n").forEach( (el) => {
          if (el.trim().length <= 0) return;
          [dxLocation, name, accessLevel, _] = el.split("\t");
          if (accessLevel) {
            results.push({
              project_name: name,
              dx_location: dxLocation,
              access_level: accessLevel,
            });
          }
        });
        return callback(null, results);
      });
    } else {
      return callback(null, results);
    }
  });
};

/**
 * Use the dx-toolkit to describe a dnanexus item through JSON.
 *
 * @param {string} dnanexusId The DNAnexus identifier.
 * @param {callback} callback
 **/
module.exports.describeDXItem = function(dnanexusId, callback) {
  let cmd = "dx describe " + dnanexusId + " --json";
  utils.runCommand(cmd, (err, stdout) => {
    if (!stdout) return callback(err, stdout);
    return callback(err, JSON.parse(stdout));
  });
};

/**
 * List all of the files available for download in a DNAnexus project.
 *
 * @param {string} projectId The DNAnexus identifier (project-*).
 * @param {boolean} allFiles List all files or just St. Jude Cloud associated ones.
 * @param {callback} callback
 **/
module.exports.listDownloadableFiles = function(projectId, allFiles, callback) {
  let cmd = "dx find data --path " + projectId + ":/ --json --state closed --class file";
  if (!allFiles) {
    cmd += " --tag " + config.DOWNLOADABLE_TAG;
  }

  utils.runCommand(cmd, (err, stdout) => {
    return callback(err, JSON.parse(stdout));
  });
};

/**
 * Uploads a file to the /uploads/ directory of a project
 * 
 * @param {string} file File object from the Vuex store.
 * @param {string} projectId DNAnexus ID of projectId being uploaded to.
 * @param {callback} progressCb 
 * @param {callback} finishedCb 
 * @return {child_process} ChildProcess
*/
module.exports.uploadFile = (file, projectId, progressCb, finishedCb) => {
  let dxPath = projectId + ":/uploads/" + path.basename(file.path.trim());

  try {
    utils.runCommandSync(`dx rm -a '${dxPath}' || true`);
  } catch (e) {
    // If this fails, not a big deal. Just means there is no file at
    // this path to begin with.
  }

  /** Setup remote size callback **/
  let lowestValue = -1;
  let sizeCheckerInterval = setInterval(() => {
    if (file.sizeCheckingLock) {
      return;
    }

    file.sizeCheckingLock = true;
    module.exports.describeDXItem(dxPath, (err, obj) => {
      file.sizeCheckingLock = false;

      if (!obj || !obj.parts) return;
      let totalSize = 0;
      for (let part in obj.parts) { totalSize += obj.parts[part].size; } // eslint-disable-line
      if (lowestValue > totalSize) {
        totalSize = lowestValue;
      } else {
        lowestValue = totalSize;
      }

      let progress = totalSize / file.raw_size * 100.0;
      progressCb(progress);
    });
  }, utils.randomInt(500, 750)); // randomized interval for jitter.

  let innerCb = (err, result) => {
    clearInterval(sizeCheckerInterval);
    finishedCb(err, result);
  };

  let command = "dx upload -p --path '" + dxPath + "' '" + file.path + "'";
  let process = utils.runCommand(command, (err, stdout) => {
    if (err) {
      return innerCb(err, null);
    }
    let tagCommand = "dx tag '" + dxPath + "' sjcp-needs-analysis";
    utils.runCommand(tagCommand, (err, stdout) => {
      if (err) {
        innerCb(err, null);
      }
      innerCb(null, stdout);
    });
  });
  return process;
};

/**
 * Download a file from DNAnexus.
 * 
 * @param {string} downloadLocation Folder for the downloaded file to reside.
 * @param {string} fileName Name of the downloaded file.
 * @param {string} fileRawSize Size in bytes of the file, received from DNAnexus.
 * @param {string} fileId DNAnexus id of the file to be downloaded.
 * @param {callback} updateCb To be called on each update to progress.
 * @param {callback} finishedCb To be called upon completion.
 * @return {child_process} ChildProcess
*/
module.exports.downloadFile = function(downloadLocation, fileName, fileRawSize, fileId, updateCb, finishedCb) {
  const outputPath = expandHomeDir(path.join(downloadLocation, fileName));
  const platform = os.platform();

  if (platform === "darwin" || platform === "linux") {
    utils.runCommandSync("touch '" + outputPath + "'");
  } else if (platform === "win32") {
    utils.runCommandSync("New-Item '" + outputPath + "' -type file -force");
  }

  const cmd = "dx download -f " + fileId + " -o '" + outputPath + "'";
  fs.watchFile(outputPath, {interval: 200}, () => {
    fs.stat(outputPath, (err, stats) => {
      if (stats !== undefined) {
        let progress = Math.round(stats.size / fileRawSize * 100.0);
        updateCb(progress);
      }
    });
  });
  return utils.runCommand(cmd, finishedCb);
};
