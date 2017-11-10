/**
 * @fileOverview Determines what html page to display based on what requirements for uploading files are met.
 **/

const os = require("os");
const utils = require("./utils");
const logging = require("./logging");

module.exports.state = {
  NEED_INSTALL: {
    path: "install",
  },
  NEED_LOGIN: {
    path: "login",
  },
  UPLOAD: {
    path: "upload",
  },
  UNKNOWN: {
    path: "unknown",
  },
};

/**
 * Determines what route to use on startup.
 *
 * @param {callback} callback Callback function
 * @return {string} html file to be loaded
 */
module.exports.getState = function(callback) {
  self = this;
  const platform = os.platform();

  if (platform != "darwin" && platform != "linux" && platform != "win32") {
    console.error("Could not determine platform: ", platform);
    return callback(self.state.UNKNOWN);
  }

  utils.initSJCloudHome((err, res) => {
    logging.info(`ERR: ${err}, RES: ${res}`);

    if (err) {
      console.error("Error occurred:", err);
      return callback(self.state.UNKNOWN);
    }

    utils.dxToolkitOnPath((err, res) => {
      if (err) {
        console.error(err);
        return callback(self.state.NEED_INSTALL);
      }

      utils.dxLoggedIn((err, res) => {
        if (err) {
          return callback(self.state.NEED_LOGIN);
        }

        utils.dxCheckProjectAccess((err, res) => {
          if (err) {
            console.error(err);
            return callback(self.state.UNKNOWN);
          }

          return callback(self.state.UPLOAD);
        });
      });
    });
  });
};
