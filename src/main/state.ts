/**
 * @module state
 * @description Determines state of the application and the appropriate HTML files to
 * show based on that state.
 **/

import * as os from 'os';

import * as utils from './utils';
import * as logging from './logging-remote';
import * as window from './window';

/**
 * Determines what route to use on startup.
 *
 * @param callback
 * @return The state object containing the HTML file to show.
 */
export function getState(token: string, callback: (state: object) => void) {
  const platform = os.platform();
  const states = {
    NEED_LOGIN: { path: 'login' },
    UPLOAD: { path: 'upload' },
    UNKNOWN: { path: 'unknown' },
  };

  logging.debug('');
  logging.debug('== Determining state ==');

  if (platform !== 'darwin' && platform !== 'linux' && platform !== 'win32') {
    console.error(`Invalid platform: ${platform}.`);
    return callback(states.UNKNOWN);
  }

  logging.debug(`  [*] Platform is ${platform}.`);
  utils.initSJCloudHome((err, res) => {
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
