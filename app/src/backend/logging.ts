/**
 * @module logging
 * @description Logger module using winston to provide logging functionality.
 */

const os = require('os');
const path = require('path');
const winston = require('winston');
const moment = require('moment');
const fs = require('fs-extra');
const env = require('./env');

const platform = os.platform();
const nodeEnvironment = process.env.NODE_ENV || 'production';

let logLevel = '';
let loggingFile = path.join(
  platform === 'win32' ? process.env.USERPROFILE : process.env.HOME,
  '.sjcloud/log.txt'
);
fs.ensureFileSync(loggingFile);

if (process.env.LOG_LEVEL) {
  logLevel = process.env.LOG_LEVEL;
} else if (env.isTesting()) {
  logLevel = 'critical';
} else if (env.isProduction()) {
  logLevel = 'info';
} else logLevel = 'debug';

let logging = new winston.Logger({
  level: logLevel,
  handleExceptions: false,
  transports: [
    new winston.transports.Console({
      timestamp() {
        return moment().format('YYYY-MM-DD HH:mm:ss.SSSS');
      },
      formatter(params: any) {
        return `[${params.timestamp()}] [${params.level.padEnd(6)}] *** ${
          params.message
        }`;
      },
    }),
    new winston.transports.File({
      filename: loggingFile,
      maxsize: 5242880,
      json: false,
    }),
  ],
});

export {logging, logLevel};
