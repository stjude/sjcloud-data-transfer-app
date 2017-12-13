/**
 * @file Menu configuration for the Electron application.
 *
 */


const app = require("electron").app;
import { logging } from "./logging";

logging.info("   [*] Setting application menu...");

export let menuConfig = [
  {
    label: "SJCPUploader",
    submenu: [
      {
        label: "About SJCPUploader",
        selector: "orderFrontStandardAboutPanel:",
      },
      { type: "separator", },
      {
        label: "Quit",
        accelerator: "Command+Q",
        click: () => {
          app.quit();
        },
      }
    ],
  }, {
    label: "Edit",
    submenu: [
      {
        label: "Undo",
        accelerator: "CmdOrCtrl+Z",
        selector: "undo:",
      },
      {
        label: "Redo",
        accelerator: "Shift+CmdOrCtrl+Z",
        selector: "redo:",
      },
      {
        type: "separator",
      },
      {
        label: "Cut",
        accelerator: "CmdOrCtrl+X",
        selector: "cut:",
      },
      {
        label: "Copy",
        accelerator: "CmdOrCtrl+C",
        selector: "copy:",
      },
      {
        label: "Paste",
        accelerator: "CmdOrCtrl+V",
        selector: "paste:",
      },
      {
        label: "Select All",
        accelerator: "CmdOrCtrl+A",
        selector: "selectAll:",
      },
    ],
  }];