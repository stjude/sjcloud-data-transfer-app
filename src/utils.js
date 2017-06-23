const os = require("os");
const fs = require("fs");
const path = require("path");
const { exec, execSync } = require("child_process");

module.exports.tokenLocation = path.join(
  os.homedir(),
  ".sjcloud",
  "auth",
  "token"
);

module.exports.readToken = function(callback) {
  /* Check if the file exists */
  fs.stat(module.exports.tokenLocation, function(err, stats) {
    if (err) return callback(err, false);

    fs.readFile(module.exports.tokenLocation, function(err, contents) {
      if (err) return callback(err, false);

      const firstLine = contents.toString().split(os.EOL)[0];
      return callback(null, firstLine);
    });
  });
};

module.exports.runCommand = function(cmd, callback) {
  exec(cmd, { shell: "/bin/bash" }, function(err, stdout, stderr) {
    if (err) {
      return callback(err, null);
    }

    if (stderr.length > 0) {
      return callback(stderr, null);
    }

    return callback(null, stdout);
  });
};

module.exports.runCommandSync = function(cmd) {
  return execSync(cmd, { shell: "/bin/bash" });
};

module.exports.dxToolkitOnPath = function(callback) {
  exec("which dx", callback);
};

module.exports.dxLoggedIn = function(callback) {
  exec("dx whoami", callback);
};

module.exports.dxCheckProjectAccess = function(callback) {
  exec("dx ls", callback);
};
