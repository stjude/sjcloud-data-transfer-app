const utils = require("./utils");

module.exports.state = {
  NEED_DOWNLOAD: {
    htmlfile: "dx-toolkit.html"
  },
  CONNECTION_ERROR: {
    htmlfile: "connection.html"
  },
  NEED_LOGIN: {
    htmlfile: "login.html"
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
