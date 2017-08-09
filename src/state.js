const utils = require("./utils");
const os = require("os");

module.exports.state = {
  NEED_DOWNLOAD: {
    htmlfile: "dx-toolkit.html"
  },
  CONNECTION_ERROR: {
    htmlfile: "connection.html"
  },
  NEED_LOGIN: {
    //htmlfile: "login.html"
    htmlfile: "oauth.html"
  },
  UPLOAD: {
    htmlfile: "upload.html"
  },
  UNKNOWN: {
    htmlfile: "unknown.html"
  }
};

module.exports.getState = function(callback) {
  self = this;

  if (os.platform() != "darwin" && os.platform() != "linux" && os.platform() != "win32") {
    return callback(self.state.UNKNOWN);
  }

  utils.dxToolkitOnPath( function(err, res) {
    if (err) {
      return callback(self.state.NEED_DOWNLOAD);
    }

    utils.dxLoggedIn( (err, res) => {
      if (err) {
        return callback(self.state.NEED_LOGIN);
      }

      utils.dxCheckProjectAccess( (err, res) => {
        if (err) {
          return callback(self.state.UNKNOWN);
        }

        return callback(self.state.UPLOAD);
      });
    });
  });
};
