const os = require("os");
const path = require("path");
const utils = require("./utils");

DOWNLOAD_URL = {
  WINDOWS: "https://wiki.dnanexus.com/images/files/dx-toolkit-v0.225.0.exe",
  MAC: "https://wiki.dnanexus.com/images/files/dx-toolkit-v0.225.0-osx.tar.gz",
  LINUX:
    "https://wiki.dnanexus.com/images/files/dx-toolkit-v0.225.0-ubuntu-14.04-amd64.tar.gz"
};

module.exports.install = function(callback) {
  const platform = os.platform();
  const tmpdir = os.tmpdir();

  if (platform == "darwin") {
    const dxTarPath = path.join(tmpdir, "dx-toolkit.tar.gz");
    const dxFolderPath = utils.getDXToolkitDir();
    utils.downloadFile(DOWNLOAD_URL.MAC, dxTarPath, function() {
      // NOTE: I unzip to the parent directory because
      // the unzip creates a structure like dx-toolkit/dx-toolkit/...
      const parentDir = path.dirname(dxFolderPath);
      utils.runCommand("tar -C " + parentDir + " -zxf " + dxTarPath, function(
        err,
        res
      ) {
        if (err) {
          console.error(err);
          return callback(err, false);
        }

        return callback(null, true);
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
  utils.runCommand("dx find projects --tag sjcloud --delim $'\t'", function(err, stdout) {
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
  utils.runCommand(command, function(err, stdout) {
    if (err) {
      return callback(err, null);
    }

    return callback(null, stdout);
  });
};
