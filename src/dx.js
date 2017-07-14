const os = require("os");
const path = require("path");
const utils = require("./utils");

DOWNLOAD_INFO = {
  WINDOWS: {
    URL:
      "https://wiki.dnanexus.com/images/files/dx-toolkit-v0.225.0.exe"
  },
  MAC: {
    URL:
      "https://wiki.dnanexus.com/images/files/dx-toolkit-v0.225.0-osx.tar.gz",
    SHA256SUM:
      "49b5bbfe62fe2b6fe3e1fdcd19308e60c931a1f9acbb21b9adde422f7bc4eaf2"
  },
  LINUX: {
    URL:
      "https://wiki.dnanexus.com/images/files/dx-toolkit-v0.225.0-ubuntu-14.04-amd64.tar.gz",
    SHA256SUM:
      "fc5b478708ed36927ce476eb64f5498db70b4cf5e7638867fae09c654a290dcc"
  }
};

function getDxDownloadUrlFromPlatform(platform) {
  if (platform == "darwin") {
    return DOWNLOAD_INFO.MAC.URL;
  }
  else if (platform == "linux")
    return DOWNLOAD_INFO.LINUX.URL;
}

function getSha256sumFromPlatform(platform) {
  if (platform == "darwin") {
    return DOWNLOAD_INFO.MAC.SHA256SUM;
  }
  else if (platform == "linux")
    return DOWNLOAD_INFO.LINUX.SHA256SUM;
}

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
        utils.untarTo(dxTarPath, parentDir, (err, res) => {
          if (err) {
            failProgress("Could not extract dx-toolkit!");
            return callback(err, false);
          }

          updateProgress("100%", "Success!");
          setTimeout( () => {
            return callback(null, true);
          }, 1000);
        });
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

module.exports.listProjects = (callback) => {
  utils.runCommand("dx find projects --tag sjcloud --delim $'\t'", (err, stdout) => {
    if (err) {
      return callback(err, []);
    }

    var results = [];
    stdout.split("\n").forEach( (el) => {
      if (el.trim().length <= 0) return;

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

module.exports.uploadFile = (file, project, callback) => {
  let dx_path = project + ":/uploads/" + path.basename(file.trim());
  let rmCommand = "dx rm -a '" + dx_path + "'";
  console.log(rmCommand)
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
