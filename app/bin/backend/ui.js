/**
 * @fileOverview Controls the UI
*/

const os = require("os");
const url = require("url");
const path = require("path");
const electron = require("electron");
const BrowserWindow = electron.BrowserWindow;

const config = require("../../../config.json");

const platform = os.platform();
let width = 900; // TODO check if these are the right dimensions for Mac. I doubt they are -Andrew
let height = 630;

if (platform === "linux") {
  width = 900;
  height = 620;
} else if (platform === "win32") {
  width = 890;
  height = 630;
} else if (platform === "darwin") {
  width = 900;
  height = 620;
}

module.exports.createWindow = (callback) => {
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    useContentSize: true,
    resizable: false,
    maximizable: false,
    frame: true,
    icon: path.join(__dirname, "assets/icons/png/64x64.png"),
    show: false,
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  /** Attach key libraries to window **/
  mainWindow.$ = require("jquery");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  return callback(mainWindow);
};

const internal_url = "https://cloud.stjude.org";

let client_id = "sjcloud-desktop-dev";
if (config.ENVIRONMENT === "prod") {
  client_id = "sjcloud-data-transfer-app";
}

const oauth_url = `https://platform.dnanexus.com/login?scope=%7B%22full%22%3A+true%7D&redirect_uri=https%3A%2F%2Flocalhost%3A4433%2Fauthcb&client_id=${client_id}`;


module.exports.createOauthWindow = (internal, callback) => {
  RemoteBrowserWindow = require("electron").remote.BrowserWindow;
  loginWindow = new RemoteBrowserWindow({
    width: 1080,
    height: 960,
    frame: true,
    webPreferences: {
      nodeIntegration: false,
    },
  });

  loginWindow.webContents.on("did-get-redirect-request", function(event, oldUrl, newUrl) {
    // Redirect the browser to the oauth login
    // If the browser isn't trying to go to cloud.stjude.org
    // OR if it's actually going to the Oauth page.
    //
    // Really, this just accomplishes a redirect straight to the 
    // oauth page rather than landing on platform.dnanexus.com after
    // login.

    const match = /https:\/\/platform.dnanexus.com\/login\?code/g.exec(newUrl);
    if (match != null) {
      event.preventDefault();
      var timer = setInterval(() => {
        if (loginWindow.webContents.getURL() === "https://platform.dnanexus.com/") {
          clearInterval(timer);
          loginWindow.loadURL(oauth_url);
        }
      }, 1000);
    }
  });

  const url = internal ? internal_url : oauth_url;
  loginWindow.loadURL(url);
  loginWindow.show();
  return callback(loginWindow);
};