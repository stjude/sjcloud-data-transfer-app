/**
 * @fileOverview Utility functions.
*/

const os = require("os");
const fs = require("fs");
const path = require("path");
const https = require("https");
const mkdirp = require("mkdirp");
const crypto = require("crypto");
const { exec, execSync } = require("child_process");

module.exports._sjcloud_homedir = path.join( os.homedir(), ".sjcloud" );
/**
 * Find or create the ".sjcloud" directory in the users home directory and return its path.
 * @returns {string} Path of ".sjcloud" directory
*/
module.exports.getSJCloudHomeDir = function() {
  if (!fs.existsSync(module.exports._sjcloud_homedir)) {
    mkdirp(module.exports._sjcloud_homedir, function(err) {
      if (err) {
        return null;
      }
      return module.exports._sjcloud_homedir;
    });
  }
  return module.exports._sjcloud_homedir;
};

module.exports._dx_toolkit_dir = path.join( module.exports._sjcloud_homedir, "dx-toolkit" );
/**
 * Find or create the "dx-toolkit" directory in the ".sjcloud" directory and return its path.
 * @returns {string} Path of "dx-toolkit" directory
*/
module.exports.getDXToolkitDir = function() {
  if (!fs.existsSync(module.exports._dx_toolkit_dir)) {
    mkdirp(module.exports._dx_toolkit_dir, function(err) {
      if (err) {
        return null;
      }
      return module.exports._dx_toolkit_dir;
    });
  }
  return module.exports._dx_toolkit_dir;
};

module.exports._dx_toolkit_env_file = path.join( module.exports._dx_toolkit_dir, "environment" ); // file only on Linux and Mac installations
module.exports._dnanexus_PS_script = "C:\\Program Files (x86)\\DNAnexus CLI\\dnanexus-shell.ps1"; // default install location of dx-toolkit on Windows
/**
 * Runs commands on the system command line
 * @param {string} cmd Text to be entered at the command line
 * @param {function} callback cb function
 * @returns {runCommandReturn}
*/
module.exports.runCommand = function(cmd, callback) {
  var inner_callback = function (err, stdout, stderr) {
    if (err) {
      return callback(err, null);
    }
    if (stderr.length > 0) {
      return callback(stderr, null);
    }
    return callback(null, stdout);
  };

  if (os.platform() == "darwin" || os.platform() == "linux") {
    const dxToolkitEnvFile = module.exports._dx_toolkit_env_file;
    fs.stat(module.exports._dx_toolkit_env_file, function(err, stats) {
      if (!err) {  // fs.stat() is only to check if "dx" commands can be sourced. If it fails other commands can still be run.
        cmd = "source " + dxToolkitEnvFile + "; " + cmd;
      }
      return exec(cmd, { shell: "/bin/bash" }, inner_callback);
    });
  }
 
  else if (os.platform() == "win32") {
    const dnanexusPSscript = module.exports._dnanexus_PS_script;
    fs.stat(dnanexusPSscript, function(err, stats) {
      if (!err) {  // fs.stat() is only to check if "dx" commands can be sourced. If it fails other commands can still be run.
        cmd = ".'" + dnanexusPSscript + "'; " + cmd;
      }
      cmd = "powershell.exe " + cmd;
      return exec(cmd, inner_callback);  // Warning: the dnanexus-shell.ps1 script used to source environment variables on Windows sends a DNAnexus banner to STDOUT. Banner will be first 3 lines of STDOUT
    });
  }
};

//TODO unify function syntax below

/**
 * Determines if dx-toolkit is correctly installed on the system.
 * @param {function} callback cb function
*/
module.exports.dxToolkitOnPath = function(callback) {
  if (os.platform() == "linux" || os.platform() == "darwin") {
    this.runCommand("which dx", callback);
  }
  else if (os.platform() == "win32") {
    this.runCommand("get-command dx", callback);
  }
};

/**
 * Determines if the user is logged into DNAnexus
 * @param {function} callback cb function
*/
module.exports.dxLoggedIn = (callback) => {
  this.runCommand("dx whoami", callback);
};

/**
 * Checks if there's atleast one project the user can upload data to
 * @param {function} callback cb function
*/
module.exports.dxCheckProjectAccess = (callback) => {
  if (os.platform() == "linux" || os.platform() == "darwin") {
    this.runCommand("echo '0' | dx select --level UPLOAD", callback);
  }
  else if (os.platform() == "win32") {
    this.runCommand("\"echo 0 | dx select --level UPLOAD\"", callback);
  }
};

/**
 * Downloads a file
 * @param {string} url URL of download
 * @param {string} dest Path for newly downloaded file
 * @param {Function} cb cb function
*/
module.exports.downloadFile = (url, dest, cb) => { //TODO change cb
  var file = fs.createWriteStream(dest);
  var request = https.get(url, (response) => {
    response.pipe(file);
    file.on("finish", () => {
      file.close(cb);
    });
  });
};

/**
 * Untars a file to a new location
 * @param {string} file Path to tarballed file
 * @param {string} parentDir Path to the directory the tarballs contents should be dumped in
 * @param {Function} callback cb function
*/
module.exports.untarTo = (file, parentDir, callback) => {
  module.exports.runCommand("tar -C " + parentDir + " -zxf " + file, callback);
};

/**
 * Computes the SHA256 sum of a given file
 * @param {string} filepath Path to file being checksummed
 * @param {Function} callback cb function
 * @returns {runCommandReturn}
*/
module.exports.computeSHA256 = (filepath, callback) => {
  var shasum = crypto.createHash("SHA256");
  var s = fs.ReadStream(filepath);
  s.on("data", (d) => { shasum.update(d); });
  s.on("end", () => {
    const result = shasum.digest("hex");
    return callback(null, result);
  });
};
