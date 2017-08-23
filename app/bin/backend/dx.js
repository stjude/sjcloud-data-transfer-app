// TODO: add documentationin the style of http://usejsdoc.org/

const fs = require("fs");
const os = require("os");
const path = require("path");
const async = require("async");
const utils = require("./utils");
const child_process = require("child_process");
const expandHomeDir = require("expand-home-dir");

// TODO: move these variables to a JSON config file in the root directory
// of the project.
const PROJECT_TAG = "sjcp-project";
const DOWNLOADABLE_TAG = "sjcp-result-file";

DOWNLOAD_INFO = {
  WINDOWS: {
    URL: "https://wiki.dnanexus.com/images/files/dx-toolkit-v0.225.0.exe",
    SHA256SUM: "e1c2f9b92bb1c88351ef0e755df41e2522283ffa0d27ce10aeeffd66a8a6b1e2",
  },
  MAC: {
    URL: "https://wiki.dnanexus.com/images/files/dx-toolkit-v0.225.0-osx.tar.gz",
    SHA256SUM: "49b5bbfe62fe2b6fe3e1fdcd19308e60c931a1f9acbb21b9adde422f7bc4eaf2",
  },
  LINUX: {
    URL: "https://wiki.dnanexus.com/images/files/dx-toolkit-v0.225.0-ubuntu-14.04-amd64.tar.gz",
    SHA256SUM: "fc5b478708ed36927ce476eb64f5498db70b4cf5e7638867fae09c654a290dcc",
  },
};

function getDxDownloadUrlFromPlatform(platform) {
  if (platform == "darwin") {
    return DOWNLOAD_INFO.MAC.URL;
  } else if (platform == "linux") {
    return DOWNLOAD_INFO.LINUX.URL;
  } else if (platform == "win32") {
    return DOWNLOAD_INFO.WINDOWS.URL;
  }
  // TODO: handle unrecognized platform.
}

function getSha256sumFromPlatform(platform) {
  if (platform == "darwin") {
    return DOWNLOAD_INFO.MAC.SHA256SUM;
  } else if (platform == "linux") {
    return DOWNLOAD_INFO.LINUX.SHA256SUM;
  } else if (platform == "win32") {
    return DOWNLOAD_INFO.WINDOWS.SHA256SUM;
  }
  // TODO: handle unrecognized platform.
}

module.exports.install = (updateProgress, failProgress, callback) => {
  const platform = os.platform();
  const tmpdir = os.tmpdir();

  if (platform == "darwin" || platform == "linux") {
    const dxTarPath = path.join(tmpdir, "dx-toolkit.tar.gz");
    const dxFolderPath = utils.getDXToolkitDir();
    updateProgress("30%", "Downloading...");
    utils.downloadFile(getDxDownloadUrlFromPlatform(platform), dxTarPath, () => {
      updateProgress("60%", "Verifying...");
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

        updateProgress("90%", "Extracting...");
        const parentDir = path.dirname(dxFolderPath);
        utils.untarTo(dxTarPath, parentDir, function(err, res) {
          if (err) {
            failProgress("Could not extract dx-toolkit!");
            return callback(err, false);
          }
        });

        updateProgress("100%", "Success!");
        return callback(null, true);
      });
    });
  } else if (platform == "win32") {
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
          setTimeout( () => {
            return callback(null, true);
          }, 1);
        }, 1000);
      });
    });
  }
};

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

module.exports.listProjects = (allProjects, callback) => {
  if (os.platform() == "darwin" || os.platform() == "linux") {
    var tabliteral = "$'\t'";
  } else if (os.platform() == "win32") {
    var tabliteral = "`t";
  }

  let cmd = "dx find projects --level UPLOAD --delim " + tabliteral; 
  if (!allProjects) {
    cmd += " --tag " + PROJECT_TAG;
  }
  utils.runCommand(cmd, (err, stdout) => {
    if (err) {
      return callback(err, []);
    }

    let results = [];
    stdout.split("\n").forEach( (el) => {
      if (el.trim().length <= 0) return;
      [dx_location, name, access_level, _] = el.split("\t");
      if (access_level) {
        results.push({
          project_name: name,
          dx_location: dx_location,
          access_level: access_level,
        });
      }
    });
    return callback(null, results);
  });
};

module.exports.describeProject = function(projectId, cb) {
  utils.runCommand("dx describe " + projectId + " --json", (err, stdout) => {
    return cb(err, JSON.parse(stdout));
  });
};

module.exports.listDownloadableFiles = function(projectId, allFiles, cb) {
  let cmd = "dx find data --path " + projectId + ":/ --json";
  if (!allFiles) {
    cmd += " --tag " + DOWNLOADABLE_TAG;
  }

  utils.runCommand(cmd, (err, stdout) => {
    return cb(err, JSON.parse(stdout));
  });
};

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

module.exports.downloadFile = function(downloadLocation, fileName, fileRawSize, fileId, updateCb, finishedCb) {
  let outputPath = expandHomeDir(path.join(downloadLocation, fileName));
  let cmd = "dx download -f " + fileId + " -o " + outputPath;

  utils.runCommand("rm " + outputPath + "; touch " + outputPath, () => {
    fs.watchFile(outputPath, {interval: 200}, () => {
      fs.stat(outputPath, (err, stats) => {
        if (stats !== undefined) {
          let progress = Math.round(stats.size / fileRawSize * 100.0);
          updateCb(progress);
        }
      });
    });

    utils.runCommand(cmd, function(err, result) {
      return finishedCb(err, result);
    });
  });
};

module.exports.getToolsInformation = function(allProjects, allFiles, callback) {
  module.exports.listProjects(allProjects, function(err, results) {
    async.map(results, function(elem, cb) {
      let item = {
        name: elem.project_name,
        size: 0,
        upload: [],
        download: [],
      };

      module.exports.describeProject(elem.dx_location, (err, describe) => {
        item.size = utils.readableFileSize(describe.dataUsage * 1e9, true);

        module.exports.listDownloadableFiles(elem.dx_location, allFiles, (err, files) => {
          let downloadableFiles = [];
          console.log(err);

          files.forEach((elem) => {
            let dl_file = {
              name: elem.describe.name,
              status: 0,
              checked: false,
              finished: false,
              size: utils.readableFileSize(elem.describe.size),
              raw_size: elem.describe.size,
              dx_location: elem.project + ":" + elem.id,
            };

            downloadableFiles.push(dl_file);
          });

          item.download = downloadableFiles;
          return cb(null, item);
        });
      });
    }, function(err, allTools) {
      return callback(allTools);
    });
  });
};
