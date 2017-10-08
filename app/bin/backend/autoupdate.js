const electron = require("electron");

const server = "https://warm-fortress-45813.herokuapp.com/";
const feed = `${server}/update/${process.platform}/${electron.app.getVersion()}`;

electron.autoUpdater.setFeedURL(feed);

setInterval(() => {
  electron.autoUpdater.checkForUpdates();
}, 60000);

electron.autoUpdater.on("error", (error) => {
  logging.error(error);
});

electron.autoUpdater.on("checking-for-update", () => {
  logging.debug("Checking for updates...");
});

electron.autoUpdater.on("update-available", () => {
  logging.debug("Update available!");
});

electron.autoUpdater.on("update-not-available", () => {
  logging.debug("Update not available...");
});

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