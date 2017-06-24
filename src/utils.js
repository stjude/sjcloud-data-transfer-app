const os = require("os");
const fs = require("fs");
const path = require("path");
const https = require('https');
const mkdirp = require("mkdirp");
const crypto = require('crypto');
const { exec, execSync } = require("child_process");

module.exports._sjcloud_homedir = path.join( os.homedir(), ".sjcloud" )
module.exports.getSJCloudHomeDir = function() {
  if (!fs.existsSync(module.exports._sjcloud_homedir)) {
      mkdirp(module.exports._sjcloud_homedir, function (err) {
        if (err) {
          return null;
        }

        return module.exports._sjcloud_homedir;
      });
  }
  return module.exports._sjcloud_homedir;
}

module.exports._dx_toolkit_dir = path.join( module.exports._sjcloud_homedir, "dx-toolkit/" );
module.exports.getDXToolkitDir = function() {
  if (!fs.existsSync(module.exports._dx_toolkit_dir)) {
      mkdirp(module.exports._dx_toolkit_dir, function (err){
        if (err) {
          return null;
        }

        return module.exports._dx_toolkit_dir;
      });
  }
  return module.exports._dx_toolkit_dir;
}

module.exports._dx_toolkit_env_file = path.join( module.exports._dx_toolkit_dir, "environment" );

module.exports.runCommand = function(cmd, callback) {
  const dxToolkitEnvFile = module.exports._dx_toolkit_env_file;
  fs.stat(module.exports._dx_toolkit_env_file, function (err, stats) {

    if (!err) {
      cmd = "source " + dxToolkitEnvFile + "; " + cmd;
    }

    exec(cmd, { shell: "/bin/bash" }, function(err, stdout, stderr) {
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

module.exports.runCommandSync = function(cmd) {

  const dxToolkitEnvFile = module.exports._dx_toolkit_env_file;
  fs.stat(module.exports._dx_toolkit_env_file, function (err, stats) {

    if (!err) {
      cmd = "source " + dxToolkitEnvFile + "; " + cmd;
    }

    return execSync(cmd, { shell: "/bin/bash" });

  });
};

module.exports.dxToolkitOnPath = function(callback) {
  this.runCommand("which dx", callback);
};

module.exports.dxLoggedIn = function(callback) {
  this.runCommand("dx whoami", callback);
};

module.exports.dxCheckProjectAccess = function(callback) {
  this.runCommand("dx ls", callback);
};

module.exports.downloadFile = function(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);
    });
  });
}

module.exports.untarTo = function (file, parentDir, callback) {
  module.exports.runCommand("tar -C " + parentDir + " -zxf " + file, callback);
}

module.exports.computeSHA256 = function (filepath, callback) {
  var shasum = crypto.createHash('SHA256');
  var s = fs.ReadStream(filepath);
  s.on('data', function(d) { shasum.update(d); });
  s.on('end', function() {
      const result = shasum.digest('hex');
      return callback(null, result);
  });
}