/**
 * @fileOverview Controls the UI
*/

const url = require("url");
const path = require("path");
const electron = require("electron");
const BrowserWindow = electron.BrowserWindow;

module.exports.createWindow = (callback) => {
  mainWindow = new BrowserWindow({
    width: 890,
    height: 620,
    useContentSize: true,
    maximizable: false,
    show: false,
    icon: path.join(__dirname, "assets/icons/png/64x64.png"),
  });
    
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
  
  /** Attach key libraries to window **/
  mainWindow.$ = require("jquery");
  mainWindow.dx = require("./dx");
  mainWindow.electron = electron;
  mainWindow.protocol = require("./protocol");
  mainWindow.state = require("./state");
  mainWindow.utils = require("./utils");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.setResizable(false);
  return callback(mainWindow);
};

const internal_url = "https://cloud.stjude.org";
const oauth_url = "https://platform.dnanexus.com/login?scope=%7B%22full%22%3A+true%7D&redirect_uri=https%3A%2F%2Flocalhost%3A4433%2Fauthcb&client_id=sjcloud-desktop-dev";


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

    if (match !== null) {
      event.preventDefault();
      let timer = setInterval(() => {
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
