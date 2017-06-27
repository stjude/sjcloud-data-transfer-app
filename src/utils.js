const os = require("os");
const fs = require("fs");
const path = require("path");
const https = require('https');
const mkdirp = require("mkdirp");
const crypto = require('crypto');
const { exec, execSync } = require("child_process");

module.exports._sjcloud_homedir = path.join( os.homedir(), ".sjcloud" )
module.exports.getSJCloudHomeDir = () => {
  if (!fs.existsSync(module.exports._sjcloud_homedir)) {
      mkdirp(module.exports._sjcloud_homedir, (err) => {
        if (err) {
          return null;
        }

        return module.exports._sjcloud_homedir;
      });
  }
  return module.exports._sjcloud_homedir;
}

module.exports._dx_toolkit_dir = path.join( module.exports._sjcloud_homedir, "dx-toolkit/" );
module.exports.getDXToolkitDir = () => {
  if (!fs.existsSync(module.exports._dx_toolkit_dir)) {
      mkdirp(module.exports._dx_toolkit_dir, (err) => {
        if (err) {
          return null;
        }

        return module.exports._dx_toolkit_dir;
      });
  }
  return module.exports._dx_toolkit_dir;
}

module.exports._dx_toolkit_env_file = path.join( module.exports._dx_toolkit_dir, "environment" );

module.exports.runCommand = (cmd, callback) => {
  const dxToolkitEnvFile = module.exports._dx_toolkit_env_file;
  fs.stat(module.exports._dx_toolkit_env_file, (err, stats) => {

    if (!err) {
      cmd = "source " + dxToolkitEnvFile + "; " + cmd;
    }

    exec(cmd, { shell: "/bin/bash" }, (err, stdout, stderr) => {
      if (err) {
        return callback(err, null);
      }

      if (stderr.length > 0) {
        return callback(stderr, null);
      }

      return callback(null, stdout);
    });
  });

};

module.exports.runCommandSync = (cmd) => {

  const dxToolkitEnvFile = module.exports._dx_toolkit_env_file;
  fs.stat(module.exports._dx_toolkit_env_file, (err, stats) => {

    if (!err) {
      cmd = "source " + dxToolkitEnvFile + "; " + cmd;
    }

    return execSync(cmd, { shell: "/bin/bash" });

  });
};

module.exports.dxToolkitOnPath = (callback) => {
  this.runCommand("which dx", callback);
};

module.exports.dxLoggedIn = (callback) => {
  this.runCommand("dx whoami", callback);
};

module.exports.dxCheckProjectAccess = (callback) => {
  this.runCommand("dx ls", callback);
};

module.exports.downloadFile = (url, dest, cb) => {
  var file = fs.createWriteStream(dest);
  var request = https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
      file.close(cb);
    });
  });
}

module.exports.untarTo = (file, parentDir, callback) => {
  module.exports.runCommand("tar -C " + parentDir + " -zxf " + file, callback);
}

module.exports.computeSHA256 = (filepath, callback) => {
  var shasum = crypto.createHash('SHA256');
  var s = fs.ReadStream(filepath);
  s.on('data', (d) => { shasum.update(d); });
  s.on('end', () => {
      const result = shasum.digest('hex');
      return callback(null, result);
  });
}