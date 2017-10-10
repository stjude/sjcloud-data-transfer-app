const os = require("os");
const path = require("path");
const winston = require("winston");
const config = require("../../../config.json");

const platform = os.platform();

let loggingFile = "";

if (platform === "darwin" || platform === "linux") {
  loggingFile = path.join(process.env.HOME, ".sjcloud/log.txt");
} else if (platform === "win32") {
  loggingFile = path.join(process.env.HOMEPATH, ".sjcloud/log.txt");
}

let logLevel = "debug";
if (config.ENVIRONMENT === "prod") {
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
