/**
 * @file Determines state of the application and the appropriate HTML files to
 * show based on that state.
 **/

const os = require("os");
const utils = require("./utils");
import * as logging from "./logging-remote";
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
  logging.debug("");
  logging.debug("#####################");
  logging.debug("# Determining state #");
  logging.debug("#####################");
  logging.debug("");

  if (platform !== "darwin" && platform !== "linux" && platform !== "win32") {
    console.error(`Could not determine platform: ${platform}.`);
    return callback(states.UNKNOWN);
  }

  utils.initSJCloudHome((err: object, res: object) => {
    if (err) {
      console.error(err);
      logging.debug("  --> State is UNKNOWN (error initializing SJCloud home).");
      return callback(states.UNKNOWN);
    }

    utils.dxToolkitInstalled((err: object, res: object) => {

      if (err) {
        console.error(err);
        logging.debug("  --> State is NEED_INSTALL.");
        return callback(states.NEED_INSTALL);
      }

      logging.debug("  [*] DXToolkit is installed.");
      dx.loggedIn((err: object, res: object) => {

        if (err) {
          logging.debug("  --> State is NEED_LOGIN.");
          return callback(states.NEED_LOGIN);
        }

        logging.debug("  [*] We are logged into DNAnexus.");
        dx.checkProjectAccess((err: object, res: object) => {

          if (err) {
            console.error(err);
            logging.debug("  --> State is UNKNOWN (error checking project access).");
            return callback(states.UNKNOWN);
          }

          logging.debug("  [*] We have project access.");
          return callback(states.UPLOAD);
        });
      });
    });
  });
};
