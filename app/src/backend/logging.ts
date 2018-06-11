/**
 * @module logging
 * @description A logging singleton that writes a log stream to both the console
 *   and a file.
 */

import * as os from 'os';
import * as path from 'path';

import * as moment from 'moment';
import * as winston from 'winston';

import { isProduction, isTesting } from './env';

const platform = os.platform();

const HOME = path.join(os.homedir(), '.sjcloud');
const FILENAME = 'log.txt';
const MAX_SIZE = 5242880; // bytes

const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSSS';

/**
 * Selects a log level from the environment to filter log messages.
 *
 * `level` should be one of npm's log level values (from highest to lowest
 * priority): error, warn, info, verbose, debug, or silly. See
 * <https://docs.npmjs.com/misc/config#loglevel> for more information.
 *
 * @param level overrides the log level from the environment
 * @returns an npm log level to filter logging
 */
export const envLevel = (level?: string): string => {
  if (level) {
    return level;
  } else if (isProduction()) {
    return 'info';
  } else {
    return 'debug';
  }
};

/**
 * The log level determined by the environment.
 */
export const logLevel = envLevel(process.env.LOG_LEVEL);

const consoleTransport = new winston.transports.Console({
  silent: isTesting(),
  timestamp() {
    return moment().format(TIMESTAMP_FORMAT);
  },
  formatter({ timestamp, level, message }: any) {
    return `[${timestamp()}] [${level.padEnd(6)}] *** ${message}`;
  },
});

const fileTransport = new winston.transports.File({
  // While winston will create the log file, it will not create the path if it
  // does not exist. If log files aren't being written, ensure `LOG_HOME`
  // exists.
  filename: path.join(HOME, FILENAME),
  maxsize: MAX_SIZE,
  json: false,
});

/**
 * A winston logger instance.
 */
export const logging = new winston.Logger({
  level: logLevel,
  handleExceptions: false,
  transports: [consoleTransport, fileTransport],
});
