/**
 * @module state
 * @description Determines state of the application and the appropriate HTML files to
 * show based on that state.
 **/

const os = require('os');
const utils = require('./utils');
import * as logging from './logging-remote';
import {} from './types';
import * as dx from './dx';

/**
 * Enum for possible states of the application.
 *
 * @readonly
 * @enum {any}
 */
const states = {
  NEED_LOGIN: { path: 'login' },
  UPLOAD: { path: 'upload' },
  UNKNOWN: { path: 'unknown' },
};

export { states };

/**
 * Determines what route to use on startup.
 *
 * @param callback
 * @return The state object containing the HTML file to show.
 */
export function getState(callback: (state: object) => void) {
  let self = this;
  const platform = os.platform();
  logging.debug('');
  logging.debug('== Determining state ==');

  if (platform !== 'darwin' && platform !== 'linux' && platform !== 'win32') {
    console.error(`Invalid platform: ${platform}.`);
    return callback(states.UNKNOWN);
  }

  logging.debug(`  [*] Platform is ${platform}.`);
  utils.initSJCloudHome((err: object, res: object) => {
    if (err) {
      console.error(err);
      logging.debug(
        '  --> State is UNKNOWN (error initializing SJCloud home).',
      );
      utils.reportBug(err);
      return callback(states.UNKNOWN);
    }

    logging.debug('  [*] SJCloud home directory initialized.');
    (window as any).dx.loggedIn(token, (err: object, res: object) => {
      if (err) {
        logging.debug('  --> State is NEED_LOGIN.');
        return callback(states.NEED_LOGIN);
      }

      logging.debug('  [*] We are logged into DNAnexus.');
      return callback(states.UPLOAD);
    });
  });
}
