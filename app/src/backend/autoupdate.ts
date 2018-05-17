/**
 * @module autoupdate
 * @description Checks and updates the application to the latest version.
 */

const os = require('os');
const electron = require('electron');
const {logging} = require('./logging');
const {reportBug} = require('./utils');
const config = require('../../../config.json');
const platform = os.platform();

export const server = config.UPDATE_SERVER;
export const feed = `${server}/update/${platform}/${electron.app.getVersion()}`;

/**
 * Start the update client pulling from the update server.
 */
export function startUpdateClient() {
  logging.info('   - Starting autoupdate server...');
  logging.info(`     Feed:   ${feed}`);
  logging.info('');
  logging.warn(' ***********');
  logging.warn(' * WARNING *');
  logging.warn(' ***********');
  logging.warn('');
  logging.warn(' Loading autoupdater. Code must be signed for this to work!');
  logging.warn('');

  try {
    electron.autoUpdater.setFeedURL(feed);
    electron.autoUpdater.checkForUpdates();

    setInterval(() => {
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
      logging.info('Update available!');
    });

    electron.autoUpdater.on('update-not-available', () => {
      logging.debug('Update not available.');
    });

    electron.autoUpdater.on(
      'update-downloaded',
      (event: any, releaseNotes: any, releaseName: any) => {
        logging.info('Update downloaded.');
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
            logging.info('User declined update.');
          }
        });
      }
    );
  } catch (error) {
    logging.error(
      'Could not start autoupdate server because the code is not signed.'
    );
  }
}
