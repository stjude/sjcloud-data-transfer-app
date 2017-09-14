const electron = require("electron");

const server = "https://your-deployment-url.com"; // TODO get a real server;
const feed = `${server}/update/${process.platform}/${electron.app.getVersion()}`;

electron.autoUpdater.setFeedURL(feed);

setInterval(() => {
  electron.autoUpdater.checkForUpdates();
}, 60000);

electron.autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: "info",
    buttons: ["Restart", "Later"],
    title: "Application Update",
    message: process.platform === "win32" ? releaseNotes : releaseName,
    detail: "A new version has been downloaded. Restart the application to apply the updates.",
  };

  electron.dialog.showMessageBox(dialogOpts, (response) => {
    if (response === 0) {
      electron.autoUpdater.quitAndInstall();
    }
  });
});

autoUpdater.on("error", (message) => {
  console.error("There was a problem updating the application");
  console.error(message);
});
