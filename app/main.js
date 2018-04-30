/**
 * @file Main entrypoint for the SJCP Data Upload tool.
 *       This file includes all functionality for bootstrapping
 *       the application, handling events, and logging.
 *
 * @author Clay McLeod
 * @author Andrew Frantz
 * @author Edgar Sioson
 */

/* eslint-disable no-unused-vars */

const os = require('os');
const electron = require('electron');

const app = electron.app;
const menu = electron.Menu;

const config = require('../config.json');
const ui = require('./bin/backend/ui');
const {logging, logLevel} = require('./bin/backend/logging');
const utils = require('./bin/backend/utils');

const platform = os.platform();
const nodeEnvironment = process.env.NODE_ENV || 'production';

if (nodeEnvironment !== 'production' && nodeEnvironment !== 'development') {
  logging.error("NODE_ENV must be 'production' or 'development'!");
  process.exit();
}

logging.info('');
logging.info(' ###############################################');
logging.info(' # Starting the SJCP Data Transfer Application #');
logging.info(' ###############################################');
logging.info('');
logging.info(' == Startup Information ==');
logging.info('   [*] Environment: ' + nodeEnvironment);
logging.info('   [*] Log Level: ' + logLevel);
logging.info('   [*] Process arguments:');
process.argv.forEach((elem, index) => {
  logging.info('       [-] ' + index + ': ' + elem);
});
logging.info('');
logging.info(' == Bootstrapping Environment ==');
const ipc = require('./bin/backend/ipc');
const protocol = require('./bin/backend/protocol');

/**
 * START PROGRAM.
 *
 * Below, you will see two variables. It is crucial that you understand
 * how these two variables work based on electron's application lifecycle.
 *
 *   mainWindow: this is the window object that holds all of the content
 *               for the application.
 *   startupOptions: this variable catches all of the relevant information
 *                   in the event based methods below for parsing by the 'ready'
 *                   event.
 */

let mainWindow;
let startupOptions = {};

/**
 * Performs commands to bootstrap the main window.
 * @param {*} mainWindow The window.
 */
function bootstrapWindow(mainWindow) {
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  if (!config.CHROMIUM_MENU) {
    logging.debug(
      '       [-] Production menu enabled (chromium menu disabled).'
    );
    const {menuConfig} = require('./bin/backend/menu.js');
    menu.setApplicationMenu(menu.buildFromTemplate(menuConfig));
  } else {
    logging.debug('Chromium menu enabled (production menu disabled).');
  }

  if (nodeEnvironment === 'production' && config.AUTOUPDATE_ENABLED === true) {
    const autoupdater = require('./bin/backend/autoupdate');
    autoupdater.startUpdateClient();
  }

  logging.info('');
}

/**
 * Ensure that a main window exists.
 *
 * @param {function} callback
 */
function ensureWindow(callback = undefined) {
  // If the app isn't 'ready', we can't create a window.
  if (!app.isReady()) {
    return;
  }

  if (
    mainWindow === null ||
    mainWindow === undefined ||
    mainWindow.isDestroyed()
  ) {
    ui.createWindow(mw => {
      mainWindow = mw;
      bootstrapWindow(mainWindow);
      if (callback !== undefined) {
        return callback();
      }
    });
  }
}

app.on('ready', () => {
  ensureWindow(() => {
    // Handle open-url event.
    let uriCommand = '';

    if (platform === 'win32') {
      uriCommand = protocol.handleURIWindows();
    } else if (startupOptions.open_url_event_occurred) {
      uriCommand = protocol.handleURIMac(
        startupOptions.open_url_event,
        startupOptions.open_url_url
      );
    }

    if (uriCommand) {
      logging.silly(`Running JS command: ${uriCommand}`);
      mainWindow.webContents.executeJavaScript(
        "window.setCurrPath = 'upload';"
      );
      mainWindow.webContents.executeJavaScript(uriCommand);
    }
  });
});

app.on('activate', () => {
  ensureWindow();
});

app.on('open-url', (event, url) => {
  if (!app.isReady()) {
    // this will execute if the application is not open.
    startupOptions.open_url_event_occurred = true;
    startupOptions.open_url_event = event;
    startupOptions.open_url_url = url;
  } else {
    uriCommand = protocol.handleURIMac(event, url);

    if (uriCommand !== '') {
      ensureWindow(() => {
        logging.silly(`Running JS command: ${uriCommand}`);
        mainWindow.webContents.executeJavaScript("window.currPath = 'upload';");
        mainWindow.webContents.executeJavaScript(uriCommand);
        mainWindow.webContents.executeJavaScript(
          "window.VueApp.$store.dispatch('updateToolsFromRemote', true);"
        );
      });
    }
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on(
  'certificate-error',
  (event, webContents, url, error, certificate, callback) => {
    if (url.startsWith('https://localhost:4433/authcb?code=')) {
      event.preventDefault();
      callback(true);
    } else {
      callback(false);
    }
  }
);
