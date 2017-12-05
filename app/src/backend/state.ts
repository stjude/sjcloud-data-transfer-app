/**
 * @file Determines state of the application and the appropriate HTML files to
 * show based on that state.
 **/

const os = require("os");
const utils = require("./utils");
const { logging } = require("./logging");
import {

} from "./types";

/**
 * Enum for possible states of the application.
 * @readonly
 * @enum {any}
 */
const states = {
  NEED_INSTALL: { path: "install" },
  NEED_LOGIN: { path: "login" },
  UPLOAD: { path: "upload" },
  UNKNOWN: { path: "unknown" },
};

export { states }

/**
 * Determines what route to use on startup.
 *
 * @param callback
 * @return The state object containing the HTML file to show.
 */
export function getState(callback: (state: object) => void) {
  self = this;
  const platform = os.platform();

  if (platform !== "darwin" && platform !== "linux" && platform !== "win32") {
    console.error("Could not determine platform: ", platform);
    return callback(states.UNKNOWN);
  }

  utils.initSJCloudHome((err: object, res: object) => {

    if (err) {
      console.error(err);
      return callback(states.UNKNOWN);
    }
    utils.dxToolkitInstalled((err: object, res: object) => {

      if (err) {
        console.error(err);
        return callback(states.NEED_INSTALL);
      }

      dx.loggedIn((err: object, res: object) => {
        if (err) {
          return callback(states.NEED_LOGIN);
        }

        dx.checkProjectAccess((err: object, res: object) => {
          if (err) {
            console.error(err);
            return callback(states.UNKNOWN);
          }

          return callback(states.UPLOAD);
        });
      });
    });
  });
};
