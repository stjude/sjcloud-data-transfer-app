const os = require("os");
const path = require("path");
const winston = require("winston");

const platform = os.platform();
const nodeEnvironment = process.env.NODE_ENV || "production";

let loggingFile = "";

if (platform === "darwin" || platform === "linux") {
  loggingFile = path.join(process.env.HOME, ".sjcloud/log.txt");
} else if (platform === "win32") {
  loggingFile = path.join(process.env.HOMEPATH, ".sjcloud/log.txt");
}

let logLevel = "debug";
if (nodeEnvironment === "production") {
  logLevel = "info";
}

if (loggingFile !== "") {
  winston.add(winston.transports.File, {
    filename: loggingFile,
    level: logLevel,
    json: false,
  });
}

module.exports = winston;
