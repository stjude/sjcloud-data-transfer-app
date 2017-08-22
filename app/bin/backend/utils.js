const os = require("os");
const fs = require("fs");
const path = require("path");
const https = require("https");
const mkdirp = require("mkdirp");
const crypto = require("crypto");
const {exec, execSync, spawn} = require("child_process");
const {remote, shell} = require("electron");


_sjcloud_homedir = path.join( os.homedir(), ".sjcloud" );
_dx_toolkit_dir = path.join( _sjcloud_homedir, "dx-toolkit" );
_dx_toolkit_env_file = path.join( _dx_toolkit_dir, "environment" ); // file only on Linux and Mac installations
_dnanexus_CLI_dir = "C:\\Program Files (x86)\\DNAnexus CLI"; // default install location of dx toolkit install wizard (windows)

/**
 * Creates the ~/.sjcloud directory, if it doesn't exist.
 * Callback takes args (error, created_dir) to determine
 * whether this is the user's first time to run the app.
 **/
module.exports.initSJCloudHome = function(callback) {
  fs.exists(_sjcloud_homedir, function(exists) {
    if (!exists) {
      mkdirp(_sjcloud_homedir, function(err) {
        if (err) {
          return callback(err, null);
        }
        return callback(null, true);
      });
    } else {
      return callback(null, false);
    }
  });
};

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

module.exports.runCommand = function(cmd, callback) {
  let inner_callback = function(err, stdout, stderr) {
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
      if (!err) { // fs.stat() is only to check if "dx" commands can be sourced. If it fails other commands can still be run.
        cmd = "source " + dxToolkitEnvFile + "; " + cmd;
	  }

      return exec(cmd, {shell: "/bin/bash"}, inner_callback);
    });
  } else if (os.platform() == "win32") {
    const dnanexusPSscript = path.join( module.exports._dnanexus_CLI_dir, "dnanexus-shell.ps1" );
    fs.stat(dnanexusPSscript, function(err, stats) {
      if (!err) { // fs.stat() is only to check if "dx" commands can be sourced. If it fails other commands can still be run.
        cmd = ".'" + dnanexusPSscript + "'; " + cmd;
      }
      cmd = "powershell.exe " + cmd;
      return exec(cmd, inner_callback); // Warning: the dnanexus-shell.ps1 script used to source environment variables on Windows sends a DNAnexus banner to STDOUT. Banner will be first 3 lines of STDOUT
    });
  }
};

module.exports.runCommandSpawn = function(cmd, stdin, stderr, close) {
  if (os.platform() == "darwin" || os.platform() == "linux") {
    const dxToolkitEnvFile = module.exports._dx_toolkit_env_file;
    fs.stat(module.exports._dx_toolkit_env_file, function(err, stats) {
	  // fs.stat() is only to check if "dx" commands can be sourced. If it fails other commands can still be run.
      if (!err) { cmd = "source " + dxToolkitEnvFile + "; " + cmd; }

	  let process = spawn(cmd,
        {
          shell: "/bin/bash",
          stdio: "pipe",
        }
	  );

	  process.stdout.on("data", (data) => {
        console.log(`child stdout:\n${data}`);
	  });

	  process.stderr.on("data", (data) => {
        console.error(`child stderr:\n${data}`);
	  });

	  process.on("close", close);
    });
  } else if (os.platform() == "win32") {
    const dnanexusPSscript = path.join( module.exports._dnanexus_CLI_dir, "dnanexus-shell.ps1" );
    fs.stat(dnanexusPSscript, function(err, stats) {
      if (!err) { // fs.stat() is only to check if "dx" commands can be sourced. If it fails other commands can still be run.
        cmd = ".'" + dnanexusPSscript + "'; " + cmd;
      }
      cmd = "powershell.exe " + cmd;
	  let process = spawn(cmd, 
						  {
							stdio: 'pipe',
						  }
						);
	  process.stdout.on("data", stdin);
	  process.stderr.on("data", stderr);
	  process.on("close", close);
    });
  }
};

module.exports.dxToolkitOnPath = function(callback) {
  if (os.platform() == "linux" || os.platform() == "darwin") {
    this.runCommand("which dx", callback);
  } else if (os.platform() == "win32") {
    this.runCommand("get-command dx", callback);
  }
};

module.exports.dxLoggedIn = (callback) => {
  this.runCommand("dx whoami", callback);
};

module.exports.dxCheckProjectAccess = (callback) => {
  if (os.platform() == "linux" || os.platform() == "darwin") {
    this.runCommand("echo '0' | dx select --level UPLOAD", callback);
  } else if (os.platform() == "win32") {
    this.runCommand("\"echo 0 | dx select --level UPLOAD\"", callback);
  }
};

module.exports.downloadFile = (url, dest, cb) => {
  let file = fs.createWriteStream(dest);
  let request = https.get(url, (response) => {
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
  let shasum = crypto.createHash("SHA256");
  let s = fs.ReadStream(filepath);
  s.on("data", (d) => {
    shasum.update(d);
  });
  s.on("end", () => {
    const result = shasum.digest("hex");
    return callback(null, result);
  });
};

module.exports.openExternal = function(url) {
  return shell.openExternal(url);
};

module.exports.openFileDialog = function(callback, defaultPath) {
  console.log(defaultPath);
  return callback(remote.dialog.showOpenDialog({
    buttonLabel: "Select",
    defaultPath,
    properties: ["openDirectory", "createDirectory"],
  }));
};

// Base function derived from stack overflow.
// Credit: https://stackoverflow.com/a/14919494

module.exports.readableFileSize = function(bytes, roundNumbers=false) {
  if (bytes === 0) {
    return "0 GB";
  }

  let thresh = 1000;
  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  let units = ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let u = -1;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.abs(bytes) >= thresh && u < units.length - 1);

  let number = bytes.toFixed(1);

  if (roundNumbers) {
    number = Math.round(number);
  }

  return number+" "+units[u];
};

module.exports._sjcloud_homedir = _sjcloud_homedir;
module.exports._dx_toolkit_dir = _dx_toolkit_dir;
module.exports._dx_toolkit_env_file = _dx_toolkit_env_file;
module.exports._dnanexus_CLI_dir = _dnanexus_CLI_dir;
