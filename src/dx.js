/**
 * @fileOverview Various methods for installing dx-toolkit and interacting with DNAnexus
*/

const os = require("os");
const path = require("path");
const utils = require("./utils");
const child_process = require("child_process");
const config = require("../config.json");

/**
 * Returns the URL of the dx-toolkit download for the platform the app is running on.
 * The only platforms supported are Mac, Windows, and Linux. Unknown platform case handled in state.js.
 * @see state.js
 * @param {string} platform The platform the app is running on.
 * @returns {string} URL of download
*/
function getDxDownloadUrlFromPlatform(platform) {
  if (platform == "darwin") {
    return config.DOWNLOAD_INFO.MAC.URL;
  }
  else if (platform == "linux") {
    return config.DOWNLOAD_INFO.LINUX.URL;
  }
  else if (platform == "win32") {
    return config.DOWNLOAD_INFO.WINDOWS.URL;
  }
}

/**
 * Returns the SHA256 sum of the dx-toolkit download for the platform the app is running on.
 * The only platforms supported are Mac, Windows, and Linux. Unknown platform case handled in state.js.
 * @see state.js
 * @param {string} platform The platform the app is running on.
 * @returns {string} SHA256 sum of download
*/
function getSha256sumFromPlatform(platform) {
  if (platform == "darwin") {
    return config.DOWNLOAD_INFO.MAC.SHA256SUM;
  }
  else if (platform == "linux") {
    return config.DOWNLOAD_INFO.LINUX.SHA256SUM;
  }
  else if (platform == "win32") {
    return config.DOWNLOAD_INFO.WINDOWS.SHA256SUM;
  }
}

/**
 * Installs dx-toolkit.
 * @param {function} updateProgress Function that updates on-screen progress bar.
 * @param {function} failProgress Function that displays failure message on progress bar.
 * @param {function} callback Callback function.
 * @returns {runCommandReturn}
*/
module.exports.install = (updateProgress, failProgress, callback) => {
  const platform = os.platform();
  const tmpdir = os.tmpdir();

  if (platform == "darwin" || platform == "linux") {
    const dxTarPath = path.join(tmpdir, "dx-toolkit.tar.gz");
    const dxFolderPath = utils.getDXToolkitDir();
    updateProgress("30%", "Downloading dx-toolkit...");
    utils.downloadFile(getDxDownloadUrlFromPlatform(platform), dxTarPath, () => {
      updateProgress("60%", "Verifying dx-toolkit...");
      // NOTE: I unzip to the parent directory because
      // the unzip creates a structure like dx-toolkit/dx-toolkit/...
      utils.computeSHA256(dxTarPath, (err, shasum) => {
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
        utils.untarTo(dxTarPath, parentDir, function(err, res) {
          if (err) {
            failProgress("Could not extract dx-toolkit!");
            return callback(err, false);
          }
        });

        updateProgress("100%", "Success!");
        setTimeout( () => {
          return callback(null, true);
        }, 1000);
      });
    });
  }
  else if (platform == "win32") {
    const dxExePath = path.join(utils.getDXToolkitDir(), "dx-toolkit.exe");
    updateProgress("40%", "Downloading dx-toolkit...");
    utils.downloadFile(getDxDownloadUrlFromPlatform(platform), dxExePath, () => {
      updateProgress("50%", "Verifying dx-toolkit...");
      utils.computeSHA256(dxExePath, (err, shasum) => {
        if (err) {
          failProgress("Could not verify download!");
          return callback(err, null);
        }

        if (getSha256sumFromPlatform(platform) != shasum) {
          failProgress("Could not verify download!");
          return callback("SHA sum doesn't match!", null);
        }
        
        updateProgress("70%", "Installing dx-toolkit...");

        setTimeout( () => {
          child_process.execSync(dxExePath);
          updateProgress("100%", "Success!");
            // TODO: is there a reason this is a timeout?
            // if not, just call the statement directly.
          setTimeout( () => {  // allows progress bar to display correctly
            return callback(null, true);
          }, 1);
        }, 1000);
      });
    });
  }
};

/**
 * Login to DNAnexus using an authentication token.
 * @param {string} token Authentication token
 * @param {function} callback Callback function
 * @returns {string} Error message or null if no error
 * @returns {string} Status message or null if error
*/
module.exports.login = (token, callback) => {
  utils.runCommand(
    "dx login --token " + token.toString() + " --noprojects",
    (err, stdout) => {
      if (err) {
        console.error("Could not login: " + err);
        return callback(err, null);
      }

      return callback(null, status);
    }
  );
};

/**
 * List projects the user can upload data to.
 * @param {function} callback Callback function
 * @returns {string} Error message or null if no error
 * @returns {Array} Array of {@link dx_project} objects
*/
module.exports.listProjects = (callback) => {
  if (os.platform() == "darwin" || os.platform() == "linux") {
    var tabliteral = "$'\t'";
  } else if (os.platform() == "win32") {
    var tabliteral = "`t";
  }  // unknown platforms handled in ./state.js

  utils.runCommand("dx find projects --level UPLOAD --tag " + config.PROJECT_TAG + " --delim " + tabliteral, (err, stdout) => {
    if (err) {
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
         * @property {string} access_level Level of access the user has to the project
        */
        results.push({
          project_name: name,
          dx_location: dx_location,
          access_level: access_level //TODO rm access_level. Unused.
        });
      }
    });
    return callback(null, results);
  });
};

/**
 * Uploads a file to the /uploads/ directory of a project
 * @param file
 * @param project
 * @param callback
 * @return {runCommandReturn}
*/
module.exports.uploadFile = (file, project, callback) => {
  let dx_path = project + ":/uploads/" + path.basename(file.trim());
  let rmCommand = "dx rm -a '" + dx_path + "'";
  console.log(rmCommand);
  utils.runCommand(rmCommand, () => {
    let command = "dx upload -p --path '" + dx_path + "' '" + file + "'";
    console.log(command);
    utils.runCommand(command, (err, stdout) => {
      if (err) {
        return callback(err, null);
      }

      let tagCommand = "dx tag '" + dx_path + "' sj-needs-analysis";
      console.log(tagCommand);
      utils.runCommand(tagCommand, (err, stdout) => {
        if (err) {
          return callback(err, null);
        }

        return callback(null, stdout);
      });
    });
  });
};
