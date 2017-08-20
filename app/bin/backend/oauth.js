const ui = require('./ui');
const pem = require('pem');
const https = require('https');
const express = require('express');

module.exports.waitForCode = function (cb) {
	ui.createOauthWindow(function (loginWindow) {
		pem.createCertificate({
			days: 1,
			selfSigned: true
		}, function (err, keys) {
			var app = express();

			app.get('/authcb', function (req, res) {
				console.log("Code: " + req.query.code);
				loginWindow.close();
				return cb(null, req.query.code);
			});

			https.createServer({
				key: keys.serviceKey,
				cert: keys.certificate
			}, app).listen(4433);

			console.log("Running on port 4433.");
		});
	});
};
