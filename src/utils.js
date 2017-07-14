const os = require("os");
const fs = require("fs");
const path = require("path");
const https = require("https");
const mkdirp = require("mkdirp");
const crypto = require("crypto");
const { exec, execSync } = require("child_process");

module.exports._sjcloud_homedir = path.join( os.homedir(), ".sjcloud" );
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

module.exports._dx_toolkit_env_file = path.join( module.exports._dx_toolkit_dir, "environment" );
//module.exports._dnanexus_CLI_dir = path.join( module.exports._dx_toolkit_dir, "DNAnexus CLI" );
module.exports._dnanexus_CLI_dir = "C:\\Program Files (x86)\\DNAnexus CLI";
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
    const dnanexusPSscript = path.join( module.exports._dnanexus_CLI_dir, "dnanexus-shell.ps1" );
    fs.stat(dnanexusPSscript, function(err, stats) {
      if (!err) {  // fs.stat() is only to check if "dx" commands can be sourced. If it fails other commands can still be run.
        cmd = "cd '" + module.exports._dnanexus_CLI_dir + "'; \$(.\\dnanexus-shell.ps1); " + cmd;
      }
      cmd = "powershell.exe " + cmd;
      return exec(cmd, inner_callback);  // Warning: the dnanexus-shell.ps1 script used to source environment variables on Windows sends a DNAnexus banner to STDOUT. Banner will be first 2 lines of STDOUT
    });
  }
};

module.exports.runCommandSync = (cmd) => {  // Won't work on Windows
  const dxToolkitEnvFile = module.exports._dx_toolkit_env_file;
  fs.stat(module.exports._dx_toolkit_env_file, (err, stats) => {

    if (!err) {
      cmd = "source " + dxToolkitEnvFile + "; " + cmd;
    }

    return execSync(cmd, { shell: "/bin/bash" });

  });
};

module.exports.dxToolkitOnPath = function(callback) {
  if (os.platform() == "linux" || os.platform() == "darwin") {
    this.runCommand("which dx", callback);
  }
  else if (os.platform() == "win32") {
    this.runCommand("get-command dx", callback);
  }
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
    file.on("finish", () => {
      file.close(cb);
    });
  });
};

module.exports.untarTo = (file, parentDir, callback) => {
  module.exports.runCommand("tar -C " + parentDir + " -zxf " + file, callback);
};

module.exports.computeSHA256 = (filepath, callback) => {
  var shasum = crypto.createHash("SHA256");
  var s = fs.ReadStream(filepath);
  s.on("data", (d) => { shasum.update(d); });
  s.on("end", () => {
    const result = shasum.digest("hex");
    return callback(null, result);
  });
};
