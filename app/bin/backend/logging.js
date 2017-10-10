const os = require("os");
const path = require("path");
const winston = require("winston");

const platform = os.platform();

let loggingFile = "";

if (platform === "darwin" || platform === "linux") {
  loggingFile = path.join(process.env.HOME, ".sjcloud/log.txt");
} else if (platform === "win32") {
  loggingFile = path.join(process.env.HOMEPATH, ".sjcloud/log.txt");
}

if (loggingFile !== "") {
  winston.add(winston.transports.File, {
    filename: loggingFile,
    json: false,
  });
}

module.exports = winston;
