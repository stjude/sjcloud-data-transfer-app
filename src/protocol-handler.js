const electron = require("electron");
const app = electron.app;
const os = require("os");

// Windows and Mac are the only systems custom protocol handling is supported on 

app.setAsDefaultProtocolClient("sjcloud");

// Windows protocol handler
if (os.platform() == "win32") {
  global.sjcloudURI = process.argv.slice(1);
}

// Mac protocol handler
app.on("open-url", function (event, url) {
  event.preventDefault();
  global.sjcloudURI[0] = url; // sjcloudURI is an array to support Windows
});