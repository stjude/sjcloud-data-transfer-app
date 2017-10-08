/**
 * @file Main entrypoint for the SJCP Data Upload tool.
 *       This file includes all functionality for bootstrapping
 *       the application, handling events, and logging.
 * 
 * @author Clay McLeod
 * @author Andrew Frantz
 * @author Edgar Sioson
 */

const os = require("os");
const electron = require("electron");

const app = electron.app;
const menu = electron.Menu;
const platform = os.platform();

const config = require("../config.json");
const ui = require("./bin/backend/ui");
// eslint-disable-next-line no-unused-vars
const logging = require("./bin/backend/logging");
const protocol = require("./bin/backend/protocol");

logging.info(" ###############################################");
logging.info(" # Starting the SJCP Data Transfer Application #");
logging.info(" ###############################################");
logging.info("");
logging.info(" [*] Environment: " + config.ENVIRONMENT);
logging.info(" [*] Process arguments:");
process.argv.forEach((elem, index) => {
  logging.info("   " + index + ": " + elem);
});
logging.info("");

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

  if (config.ENVIRONMENT === "prod") {
    // logging.warn(" ***********");
    // logging.warn(" * WARNING *");
    // logging.warn(" ***********");
    // logging.warn("");
    // logging.warn(" Autoupdate is currently disabled until code signing is");
    // logging.warn(" implemented!");
    // logging.warn("");
    const autoupdater = require("./bin/backend/autoupdate");
  }

  if (!config.CHROMIUM_MENU) {
    let template = require("./bin/backend/menu.js");
    menu.setApplicationMenu(menu.buildFromTemplate(template));
  }
}

/**
 * 
 */
function ensureWindow(callback=undefined) {
  // If the app isn't 'ready', we can't create a window.
  if (!app.isReady()) {
    return;
  }

  if (mainWindow === null ||
      mainWindow === undefined ||
      mainWindow.isDestroyed()) {
    ui.createWindow( (mw) => {
      mainWindow = mw;
      bootstrapWindow(mainWindow);
      if (callback !== undefined) {
        return callback();
      }
    });
  }
}

app.on("ready", () => {
  ensureWindow(() => {
    // Handle open-url event.
    let uriCommand = "";

    if (platform === "win32") {
      uriCommand = protocol.handleURIWindows();
    } else if (startupOptions.open_url_event_occurred) {
      uriCommand = protocol.handleURIMac(
        startupOptions.open_url_event,
        startupOptions.open_url_url
      );
    }

    if (uriCommand !== "") {
      logging.info(`Running JS command: ${uriCommand}`);
      mainWindow.webContents.executeJavaScript("window.setCurrPath = 'upload';");
      mainWindow.webContents.executeJavaScript(uriCommand);
    }
  });
});

app.on("activate", () => {
  ensureWindow();
});

app.on("open-url", (event, url) => {
  if (!app.isReady()) {
    // this will execute if the application is not open.
    startupOptions.open_url_event_occurred = true;
    startupOptions.open_url_event = event;
    startupOptions.open_url_url = url;
  } else {
    uriCommand = protocol.handleURIMac(event, url);

    if (uriCommand !== "") {
      logging.info(`Running JS command: ${uriCommand}`);
      mainWindow.webContents.executeJavaScript("window.currPath = 'upload';");
      mainWindow.webContents.executeJavaScript(uriCommand);
      mainWindow.webContents.executeJavaScript("window.VueApp.$store.dispatch('updateToolsFromRemote', true);");
    }
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("certificate-error", (event, webContents, url, error, certificate, callback) => {
  if (url.startsWith("https://localhost:4433/authcb?code=")) {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});
