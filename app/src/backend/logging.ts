const os = require("os");
const path = require("path");
const winston = require("winston");

const platform = os.platform();
const nodeEnvironment = process.env.NODE_ENV || "production";

let loggingFile = path.join(
  platform === "win32" ? process.env.HOMEPATH : process.env.HOME,
  ".sjcloud/log.txt"
);

let logLevel = "";

if (process.env.LOG_LEVEL) {
  logLevel = process.env.LOG_LEVEL;
} else if (nodeEnvironment === "production") {
  logLevel = "info";
} else logLevel = "debug";

if (loggingFile !== "") {
  winston.add(winston.transports.File, {
    filename: loggingFile,
    level: logLevel,
    json: false,
  });
}

let logging = winston;

export {
  logging,
  logLevel
}