/**
  * @fileOverview Utility functions.
  **/

const os = require("os");
const fs = require("fs");
const path = require("path");
const https = require("https");
const mkdirp = require("mkdirp");
const crypto = require("crypto");
const kill = require("tree-kill");
const logging = require("./logging");
const {exec, execSync} = require("child_process");
const {remote, shell} = require("electron");

sjcloudHomeDirectory = path.join( os.homedir(), ".sjcloud" );
dxToolkitDirectory = path.join( sjcloudHomeDirectory, "dx-toolkit" );
dxToolkitEnvironmentFile = path.join( dxToolkitDirectory, "environment" );
dnanexusCLIDirectory = "C:\\Program Files (x86)\\DNAnexus CLI";
defaultDownloadDir = path.join( os.homedir(), "Downloads" );

/**
 * Creates the ~/.sjcloud directory, if it doesn't exist.
 * Callback takes args (error, created_dir) to determine
 * whether this is the user's first time to run the app.
 * 
 * @param {callback} callback
 **/
module.exports.initSJCloudHome = function(callback) {
  fs.exists(sjcloudHomeDirectory, function(exists) {
    if (!exists) {
      mkdirp(sjcloudHomeDirectory, function(err) {
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

/**
 * Find or create the "dx-toolkit" directory in the ".sjcloud"
 * directory and return its path.
 * 
 * @return {string} Path of "dx-toolkit" directory
*/
module.exports.getDXToolkitDir = function() {
  if (!fs.existsSync(module.exports.dxToolkitDirectory)) {
    mkdirp(module.exports.dxToolkitDirectory, function(err) {
      if (err) {
        return null;
      }
      return module.exports.dxToolkitDirectory;
    });
  }
  return module.exports.dxToolkitDirectory;
};

/**
 * Runs commands on the system command line.
 * 
 * @param {string} cmd Text to be entered at the command line
 * @param {callback} callback
 * @return {child_process.ChildProcess}
*/
module.exports.runCommand = function(cmd, callback) {
  const platform = os.platform();
  // logging.info(`Running command: ${cmd}`);

  let inner_callback = function(err, stdout, stderr) {
    if (err) {
      return callback(err, null);
    }
    if (stderr.length > 0) {
      return callback(stderr, null);
    }
    if (platform == "win32" && stdout.startsWith("DNAnexus CLI initialized")) { // removes banner printed by dnanexus-shell.ps1 script
      stdout = stdout.split("\n").slice(4).join("\n");
    }
    return callback(null, stdout);
  };

  if (platform == "darwin" || platform == "linux") {
    const dxToolkitEnvFile = module.exports.dxToolkitEnvironmentFile;
    // fs.statSync() is only to check if "dx" commands can be sourced.
    // If it fails other commands can still be run.
    try {
      let stats = fs.statSync(module.exports.dxToolkitEnvironmentFile);
      if (stats) {
        cmd = "source " + dxToolkitEnvFile + "; " + cmd;
      }
    } catch (err) {}

    return exec(cmd, {shell: "/bin/bash", maxBuffer: 10000000}, inner_callback);
  } else if (platform == "win32") {
    const dnanexusPSscript = path.join( module.exports.dnanexusCLIDirectory, "dnanexus-shell.ps1" );
    // fs.statSync() is only to check if "dx" commands can be sourced.
    // If it fails other commands can still be run.
    try {
      let stats = fs.statSync(dnanexusPSscript);
      if (stats) {
        cmd = ".'" + dnanexusPSscript + "'; " + cmd;
      }
    } catch (err) {}

    cmd = "powershell.exe " + cmd;
    return exec(cmd, {maxBuffer: 10000000}, inner_callback);
  }
};

/**
 * Runs commands on the system command line synchronously.
 * 
 * @param {string} cmd Text to be entered at the command line
 * @return {child_process.ChildProcess}
*/
module.exports.runCommandSync = function(cmd) {
  const platform = os.platform();
  // logging.info(`Running command synchronously: ${cmd}`);

  if (platform == "darwin" || platform == "linux") {
    const dxToolkitEnvFile = module.exports.dxToolkitEnvironmentFile;
    try {
      // fs.statSync() is only to check if "dx" commands can be sourced.
      // If it fails other commands can still be run.
      let stats = fs.statSync(module.exports.dxToolkitEnvironmentFile);
      if (stats) {
        cmd = "source " + dxToolkitEnvFile + "; " + cmd;
      }
    } catch (err) {}
    return execSync(cmd, {shell: "/bin/bash", maxBuffer: 10000000});
  } else if (platform == "win32") {
    const dnanexusPSscript = path.join( module.exports.dnanexusCLIDirectory, "dnanexus-shell.ps1" );
    // fs.statSync() is only to check if "dx" commands can be sourced.
    // If it fails other commands can still be run.
    try {
      let stats = fs.statSync(dnanexusPSscript);
      if (stats) {
        cmd = ".'" + dnanexusPSscript + "'; " + cmd;
      }
    } catch (err) {}

    cmd = "powershell.exe " + cmd;
    return execSync(cmd, {maxBuffer: 10000000});
  }
};

/**
 * Determines if dx-toolkit is correctly installed on the system.
 * 
 * @param {callback} callback
*/
module.exports.dxToolkitOnPath = function(callback) {
  const platform = os.platform();
  if (platform == "linux" || platform == "darwin") {
    this.runCommand("which dx", callback);
  } else if (platform == "win32") {
    this.runCommand("get-command dx", callback);
  }
};

/**
 * Determines if the user is logged into DNAnexus
 * @param {callback} callback
*/
module.exports.dxLoggedIn = (callback) => {
  this.runCommand("dx whoami", callback);
};

/**
 * Checks if there's at least one project the user can upload data to.
 * @param {callback} callback
*/
module.exports.dxCheckProjectAccess = (callback) => {
  const platform = os.platform();

  if (platform == "linux" || platform == "darwin") {
    this.runCommand("echo '0' | dx select --level UPLOAD", callback);
  } else if (platform == "win32") {
    this.runCommand("\"echo 0 | dx select --level UPLOAD\"", callback);
  }
};

/**
 * Downloads a file.
 *
 * @param {string} url URL of download
 * @param {string} dest Path for newly downloaded file
 * @param {Function} callback Callback function
*/
module.exports.downloadFile = (url, dest, callback) => {
  let file = fs.createWriteStream(dest);
  let request = https.get(url, (response) => {
    response.pipe(file);
    file.on("finish", () => {
      file.close(callback);
    });
  });
};

/**
 * Untars a file to a new location.
 * 
 * @param {string} file Path to tarballed file
 * @param {string} parentDir Path to the directory the tarballs contents should be dumped in
 * @param {callback} callback
 **/
module.exports.untarTo = (file, parentDir, callback) => {
  module.exports.runCommand("tar -C " + parentDir + " -zxf " + file, callback);
};

/**
 * Computes the SHA256 sum of a given file.
 * 
 * @param {string} filepath Path to file being checksummed
 * @param {Function} callback Callback function
 **/
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

/**
 * Opens a URL in the default browser.
 * 
 * @param {string} url URL to open
 */
module.exports.openExternal = function(url) {
  shell.openExternal(url);
};

/**
 * Open a file dialog that can be used to select a directory.
 * 
 * @param {callback} callback
 * @param {string} defaultPath 
 * @return {callback}
 */
module.exports.openDirectoryDialog = function(callback, defaultPath = undefined) {
  let options = {
    buttonLabel: "Select",
    properties: ["openDirectory", "createDirectory"],
  };

  if (defaultPath !== undefined) {
    options = Object.assign( options, {defaultPath} );
  }

  return callback(remote.dialog.showOpenDialog(options));
};

/**
 * Open a file dialog that can be used to select a file.
 * 
 * @param {callback} callback
 * @return {callback}
 */
module.exports.openFileDialog = function(callback) {
  return callback(remote.dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
  }));
};

// Base function derived from stack overflow.
// Credit: https://stackoverflow.com/a/14919494

/**
 * Returns a readable size from a raw byte count.
 * Base function derived from stack overflow.
 * Credit: https://stackoverflow.com/a/14919494
 * 
 * @param {integer} bytes number of bytes
 * @param {boolean} roundNumbers round the output numbers
 * @return {string} Human-readable size.
 **/
module.exports.readableFileSize = function(bytes, roundNumbers=false) {
  if (isNaN(bytes)) {
    return "0 B";
  }
  if (bytes === 0) {
    return "0 GB";
  }

  let thresh = 1000;
  if (Math.abs(bytes) < thresh) {
    return Math.round(bytes.toFixed(1)) + " B";
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

/**
 * Return the basename and size of a file from the path.
 * 
 * @param {string} filepath Path where the file resides.
 * @param {boolean} checked Whether the entry should start out checked.
 * @return {object} object containing name and size properties.
 */
module.exports.fileInfoFromPath = function(filepath, checked) {
  name = path.basename(filepath);
  size = fs.statSync(filepath).size;
  return {
    name,
    path: filepath,
    size: module.exports.readableFileSize(size),
    raw_size: size,
    status: 0,
    checked,
    waiting: false,
    started: false,
    finished: false,
  };
};

/**
 * Generate a random number between min and max.
 * 
 * @param {integer} min minimum number
 * @param {integer} max maximum number
 * @return {integer} random integer.
 */
module.exports.randomInt = function(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

module.exports.killProcess = function(pid) {
  return kill(pid);
};

module.exports.resetFileStatus = function(file) {
  file.status = 0;
  file.waiting = false;
  file.started = false;
  file.finished = false;
  file.errored = false;
};

module.exports.saveToFile = function (filename,content) {
  fs.writeFile( sjcloudHomeDirectory+'/'+filename, content, function(err) {
    if(err) {
      return console.log(err);
    }
  });
}

module.exports.readCachedFile = function (filename, callback, defaultContent=null) {
  fs.readFile( sjcloudHomeDirectory+'/'+filename, function(err,data) {
    if(err) {
      console.log(err);
      if (!defaultContent) return;
    }
    
    callback(data ? data.toString() : defaultContent);
  });
}

/** EXPORTS **/

module.exports.sjcloudHomeDirectory = sjcloudHomeDirectory;
module.exports.dxToolkitDirectory = dxToolkitDirectory;
module.exports.dxToolkitEnvironmentFile = dxToolkitEnvironmentFile;
module.exports.dnanexusCLIDirectory = dnanexusCLIDirectory;
module.exports.defaultDownloadDir = defaultDownloadDir;
