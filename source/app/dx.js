/**
 * @fileOverview Methods for installing dx-toolkit and interacting with DNAnexus.
 **/

const os = require("os");
const path = require("path");
const utils = require("./utils");
const child_process = require("child_process");

const config = require("../config.json");

/**
 * Returns the URL of the dx-toolkit download for the platform the app is running on.
 * The only platforms supported are Mac, Windows, and Linux. Unknown platform case handled in state.js.
 *
 * @see state.js
 * @param {string} platform The platform the app is running on.
 * @returns {string} URL of download
*/
function getDxDownloadUrlFromPlatform(platform) {
  if (platform == "darwin") {return config.DOWNLOAD_INFO.MAC.URL;}
  else if (platform == "linux") {return config.DOWNLOAD_INFO.LINUX.URL;}
  else if (platform == "win32") {return config.DOWNLOAD_INFO.WINDOWS.URL;}
  else throw 'Invalid platform: ' + platform;
}

/**
 * Returns the SHA256 sum of the dx-toolkit download for the platform the app is running on.
 * The only platforms supported are Mac, Windows, and Linux. Unknown platform case handled in state.js.
 *
 * @see state.js
 * @param {string} platform The platform the app is running on.
 * @returns {string} SHA256 sum of download
*/
function getSha256sumFromPlatform(platform) {
  if (platform == "darwin") {return config.DOWNLOAD_INFO.MAC.SHA256SUM;}
  else if (platform == "linux") {return config.DOWNLOAD_INFO.LINUX.SHA256SUM;}
  else if (platform == "win32") {return config.DOWNLOAD_INFO.WINDOWS.SHA256SUM;}
  else throw 'Invalid platform: ' + platform;
}

/**
 * Installs the dx-toolkit.
 *
 * @param {function} updateProgress Function that updates on-screen progress bar.
 * @param {function} failProgress Function that displays failure message on progress bar.
 * @param {function} callback Callback function.
 * @returns {callback}
*/
module.exports.install = (updateProgress, failProgress, callback) => {
  const tmpdir = os.tmpdir();
  const platform = os.platform();

  if (platform == "darwin" || platform == "linux") {
    const dxFolderPath = utils.getDXToolkitDir();
    const downloadURL = getDxDownloadUrlFromPlatform(platform);
    const dxTarDownloadPath = path.join(tmpdir, "dx-toolkit.tar.gz");

    updateProgress("30%", "Downloading dx-toolkit...");

    utils.downloadFile(downloadURL, dxTarDownloadPath, () => {
      updateProgress("60%", "Verifying dx-toolkit...");

      /**
       * NOTE: I unzip to the parent directory because the unzip creates a
       *       structure like dx-toolkit/dx-toolkit/...
       **/

      utils.computeSHA256(dxTarDownloadPath, (err, shasum) => {
        if (err) {
          failProgress("Could not verify download!");
          return callback(err, null);
        }

        if (getSha256sumFromPlatform(platform) != shasum) {
          failProgress("Could not verify download!");
          return callback("SHA sum doesn't match!", null);
        }

        updateProgress("90%", "Extracting dx-toolkit...");
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
  } else if (platform == "win32") {
    const dxExePath = path.join(utils.getDXToolkitDir(), "dx-toolkit.exe");
    updateProgress("30%", "Downloading dx-toolkit...");
    utils.downloadFile(getDxDownloadUrlFromPlatform(platform), dxExePath, () => {
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
 * @returns {callback}
*/
module.exports.login = (token, callback) => {
  utils.runCommand(
    "dx login --token " + token.toString() + " --noprojects", (err, stdout) => {
      if (err) {
        console.error("Could not login: " + err);
        return callback(err, null);
      }

      return callback(null, status);
    }
  );
};

/**
 * Find and return projects the user can upload data to.
 *
 * @param {callback} callback
 * @returns {callback}
*/
module.exports.listProjects = (callback) => {
  const platform = os.platform();
  if (platform === "darwin" || platform === "linux") {
    var tabliteral = "$'\t'";
  } else if (platform === "win32") {
    var tabliteral = "`t";
  } else throw 'Unknown platform';

  utils.runCommand("dx find projects --level UPLOAD --tag " + config.PROJECT_TAG + " --delim " + tabliteral, (err, stdout) => {
    if (err) {
      // return empty list if no projects.
      // TODO(clay): is this the right course of action here?
      return callback(err, []);
    }

    var results = [];
    stdout.split("\n").forEach( (el) => {
      if (el.trim().length <= 0) return;
      [dx_location, name, access_level, _] = el.split("\t");
      if (access_level) {
        /**
        * @typedef {Object} dx_project
        * @property {string} project_name Name of the project
        * @property {string} dx_location Unique DNAnexus identifier of project
        */
        results.push({
          project_name: name,
          dx_location: dx_location,
        });
      }
    });
    return callback(null, results);
  });
};

/**
 * Uploads a file to the /uploads/ directory of a project
 * @param {string} file Name of file being uploaded
 * @param {string} project DNAnexus ID of project being uploaded to
 * @param {callback} callback
*/
module.exports.uploadFile = (file, project, callback) => {
  let dx_path = project + ":/uploads/" + path.basename(file.trim());
  let rmCommand = "dx rm -a '" + dx_path + "'";
  utils.runCommand(rmCommand, () => {
    let command = "dx upload -p --path '" + dx_path + "' '" + file + "'";
    utils.runCommand(command, (err, stdout) => {
      if (err) {
        return callback(err, null);
      }

      let tagCommand = "dx tag '" + dx_path + "' sj-needs-analysis";
      utils.runCommand(tagCommand, (err, stdout) => {
        if (err) {
          return callback(err, null);
        }

        return callback(null, stdout);
      });
    });
  });
};
