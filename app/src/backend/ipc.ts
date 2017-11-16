import * as utils from "./utils";
import { ipcMain } from "electron";
import { logging } from "./logging";

logging.info("   - Registering IPC Listeners...");

ipcMain.on("sync/generate-selfsigned", (event: any, arg: any) => {
  utils.selfSigned((err: any, certs: any) => {
    event.returnValue = certs;
  });
});