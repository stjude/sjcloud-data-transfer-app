const os = require("os");
const fs = require("fs");
const utils = require("./utils");

module.exports.state = {
	WELCOME: { htmlfile: "welcome.html" },
	NEED_DOWNLOAD: { htmlfile: "install.html" },
	CONNECTION_ERROR: { htmlfile: "connection.html" },
	NEED_LOGIN: { htmlfile: "login.html" },
	UPLOAD: { htmlfile: "upload.html" },
	UNKNOWN: { htmlfile: "unknown.html" }
};

module.exports.getState = function(callback) {
	self = this;

	if (os.platform() != "darwin" && os.platform() != "linux" && os.platform() != "win32") {
		return callback(self.state.UNKNOWN);
	}

	utils.initSJCloudHome( function (err, res) {
		if (err) { return callback(self.state.UNKNOWN); }
		if (res) { return callback(self.state.WELCOME); }

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
	});
};
