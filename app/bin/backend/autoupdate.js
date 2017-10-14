const electron = require("electron");

const server = "https://warm-fortress-45813.herokuapp.com/";
const feed = `${server}/update/${process.platform}/${electron.app.getVersion()}`;

electron.autoUpdater.setFeedURL(feed);
electron.autoUpdater.checkForUpdates();

setInterval(() => {
  electron.autoUpdater.checkForUpdates();
}, 15 * 60 * 1000);

electron.autoUpdater.on("error", (error) => {
  logging.error(error);
});

electron.autoUpdater.on("checking-for-update", () => {
  logging.info("Checking for updates...");
});

electron.autoUpdater.on("update-available", () => {
  logging.info("Update available!");
});

electron.autoUpdater.on("update-not-available", () => {
  logging.info("Update not available.");
});

electron.autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
  logging.info("Update downloaded.");
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