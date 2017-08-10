/**
 * @fileOverview Authorizes the user with DNAnexus using OAuth 
*/

var https   = require('https'),
    pem     = require('pem'),
    express = require('express'),
	request = require('request');

const {BrowserWindow} = require('electron'); 

const PORT = process.env.SJCLOUD_SERVER_PORT || 4433;

/**
 * Callback containing DNAnexus token
 *
 * @callback DNAnexusCallback
 * @param {string} error, if any. If not, null.
 * @param {string} token returned by DNAnexus.
 */

/**
 * First step in the OAuth handshake.
 */
//function sendAuthorize(callback) {
//	const params = {
//		response_type: 'code',
//		client_id: 'sjcloud-desktop-dev',
//		redirect_uri: 'https://localhost:4433/authcb'
//	};
//
//	request({
//		url: 'https://auth.dnanexus.com/oauth2/authorize',
//		method: "POST",
//		json: true,
//		body: params
//	}, function (err, resp, body) {
//		if (err) { return callback(err, null); }
//
//		const code = resp.statusCode;
//		const statusCategory = Math.floor(code / 100);
//		const successful = statusCategory == 2; // 2XX response code for success.
//
//		if (!successful) { return callback("Server responded with response code " + resp.statusCode, null); }
//
//		return callback(null, 
//		console.error("Error: " + err);
//		console.log("Response: " + JSON.stringify(resp));
//		console.log("Body: " + JSON.stringify(body));
//	});
//}

//sendAuthorize(function (){});
	//
	
function authorize(callback) {
	let authWindow = new BrowserWindow({
	    width: 800, 
	    height: 600, 
	    show: false, 
	    'node-integration': false,
	    'web-security': false
	});
	// This is just an example url - follow the guide for whatever service you are using
	var authUrl = 'https://auth.dnanexus.com/oauth2/authorize?';
	authUrl += "response_type=code&";
	authUrl += "client_id=pecan-dev&";
	authUrl += "redirect_uri=pecan.dev";

	console.log(authUrl);
	//
	// authWindow.loadURL(authUrl);
	// authWindow.show();
	// // 'will-navigate' is an event emitted when the window.location changes
	// // newUrl should contain the tokens you need
	// authWindow.webContents.on('will-navigate', function (event, newUrl) {
	//     console.log(newUrl);
	//         // More complex code to handle tokens goes here
	//         });
	//
	//         authWindow.on('closed', function() {
	//             authWindow = null;
	//             });
};

/**
 * Serve the custom HTTPS server designed to authenticate
 * with DNAnexus using OAuth2.
 *
 * @param {DNAnexusCallback} callback - callback once a token has been received.
 */

function serve (callback) {
    pem.createCertificate({
        days: 1,
        selfSigned: true
    }, function (err, keys) {
        var app = express();

        app.all('/', function (req, res) {
            console.log("In function");
            return res.send("Hello, world!");
        });

        https.createServer({
            key: keys.serviceKey,
            cert: keys.certificate
        }, app).listen(PORT);

        console.log("Running on port " + PORT + ".");
    });
}

module.exports.serve = serve;
module.exports.authorize = authorize;

authorize(function () {} );

ourserver = require("./server");
