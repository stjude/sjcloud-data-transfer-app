/**
 * @module autoupdate
 * @description Checks and updates the application to the latest version.
 */

import * as os from 'os';
import * as electron from 'electron';

import config from './config';
import { logging } from './logging';
import { reportBug } from './utils';

const platform = os.platform();
const server = config.UPDATE_SERVER;
const version = electron.app.getVersion();
const feed = `${server}/update/${platform}/${version}`;

/**
 * Start the update client pulling from the update server.
 */
export function startUpdateClient() {
  logging.info('   - Starting autoupdate server...');
  logging.info(`   - Feed: ${feed}`);
  logging.info('');

  try {
    electron.autoUpdater.setFeedURL({ url: feed });
    electron.autoUpdater.checkForUpdates();

    setInterval(() => {
      // Check for updates every 15 minutes.
      electron.autoUpdater.checkForUpdates();
    }, 15 * 60 * 1000);

    electron.autoUpdater.on('error', (error: any) => {
      logging.error(error);
      reportBug(error);
    });

    electron.autoUpdater.on('checking-for-update', () => {
      logging.debug('Checking for updates...');
    });

    electron.autoUpdater.on('update-available', () => {
      logging.debug('Update available!');
    });

    electron.autoUpdater.on('update-not-available', () => {
      logging.debug('Update not available.');
    });

    electron.autoUpdater.on(
      'update-downloaded',
      (event: any, releaseNotes: any, releaseName: any) => {
        logging.debug(`Update downloaded: ${releaseName}.`);
        const dialogOpts = {
          type: 'info',
          buttons: ['Restart', 'Later'],
          title: 'Application Update',
          message: process.platform === 'win32' ? releaseNotes : releaseName,
          detail:
            'A new version has been downloaded. Restart the application ' +
            'to apply the updates.',
        };

        electron.dialog.showMessageBox(dialogOpts, (response: any) => {
          if (response === 0) {
            electron.autoUpdater.quitAndInstall();
          } else {
            logging.debug('User declined update.');
          }
        });
      },
    );
  } catch (error) {
    logging.error(
      'Could not start autoupdate server because the code is not signed.',
    );
  }
}
