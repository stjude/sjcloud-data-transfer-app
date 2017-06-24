const os = require("os");
const path = require("path");
const utils = require("./utils");

DOWNLOAD_INFO = {
  WINDOWS: {
    URL: "https://wiki.dnanexus.com/images/files/dx-toolkit-v0.225.0.exe"
  },
  MAC: {
    URL:
      "https://wiki.dnanexus.com/images/files/dx-toolkit-v0.225.0-osx.tar.gz",
    SHA256SUM:
      "49b5bbfe62fe2b6fe3e1fdcd19308e60c931a1f9acbb21b9adde422f7bc4eaf2"
  },
  LINUX: {
    URL:
      "https://wiki.dnanexus.com/images/files/dx-toolkit-v0.225.0-ubuntu-14.04-amd64.tar.gz"
  }
};

module.exports.install = function(updateProgress, failProgress, callback) {
  const platform = os.platform();
  const tmpdir = os.tmpdir();

  if (platform == "darwin") {
    const dxTarPath = path.join(tmpdir, "dx-toolkit.tar.gz");
    const dxFolderPath = utils.getDXToolkitDir();
    updateProgress("30%", "Downloading dx-toolkit...");
    utils.downloadFile(DOWNLOAD_INFO.MAC.URL, dxTarPath, function() {

      updateProgress("60%", "Verifying dx-toolkit...");
      // NOTE: I unzip to the parent directory because
      // the unzip creates a structure like dx-toolkit/dx-toolkit/...
      utils.computeSHA256(dxTarPath, function(err, shasum) {
        if (err) {
          failProgress("Could not verify download!");
          return callback(err, null);
        }

        if (DOWNLOAD_INFO.MAC.SHA256SUM != shasum) {
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

          updateProgress("100%", "Success!");
          setTimeout(function () {
            return callback(null, true)
          }, 1000);
        });
      });
    });
  }
};

module.exports.login = function(token, callback) {
  utils.runCommand(
    "dx login --token " + token.toString() + " --noprojects",
    function(err, stdout) {
      if (err) {
        console.error("Could not login: " + err);
        return callback(err, null);
      }

      return callback(null, status);
    }
  );
};

module.exports.listProjects = function(callback) {
  utils.runCommand("dx find projects --tag sjcloud --delim $'\t'", function(
    err,
    stdout
  ) {
    if (err) {
      return callback(err, []);
    }

    var results = [];
    stdout.split("\n").forEach(function(el) {
      [dx_location, name, access_level, _] = el.split("\t");
      results.push({
        project_name: name,
        dx_location: dx_location,
        access_level: access_level
      });
    });

    return callback(null, results);
  });
};

module.exports.uploadFile = function(file, project, callback) {
  let dx_path = project + ":/" + path.basename(file.trim());
  let command = "dx upload --path '" + dx_path + "' '" + file + "'";
  console.log(command);
  utils.runCommand(command, function(err, stdout) {
    if (err) {
      return callback(err, null);
    }

    return callback(null, stdout);
  });
};
