const ui = require("./ui");
const pem = require("pem");
const https = require("https");
const express = require("express");
const $ = require("jquery");


module.exports.parseCode = function(url, callback) {
  let raw_code = /code=([^&]*)/.exec(url) || null;
  let code = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
  let error = /\?error=(.+)$/.exec(url);

  return callback(error, code);
};

module.exports.waitForCode = function(internal, cb) {
  ui.createOauthWindow(internal, function(window) {
    pem.createCertificate({
      days: 1,
      selfSigned: true,
    }, function(err, keys) {
      let app = express();

      let server = https.createServer({
        key: keys.serviceKey,
        cert: keys.certificate,
      }, app);

      window.on("close", () => {
        server.close();
        window = null;
      });

      app.get("/authcb", function(req, res) {
        if (window) {
          window.close();
          // Do not set window to null here. Weird errors ensue.
        }

        return cb(null, req.query.code);
      });

      server.listen(4433);
      console.log("Running OAuth listener on port 4433.");
    });
  });
};

module.exports.getToken = function(internal, callback) {
  module.exports.waitForCode(internal, function(err, code) {
    if (err) return callback(err, null);
    $.post("https://auth.dnanexus.com/oauth2/token", {
      grant_type: "authorization_code",
      code: code,
      redirect_uri: "https://localhost:4433/authcb",
    }, (data) => {
      let authToken = data.access_token;
      return callback(null, authToken);
    });
  });
};
