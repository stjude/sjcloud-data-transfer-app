/**
 * @module oauth
 * @description Contains all OAuth functionality for the application.
 *
 */

const ui = require('./ui');
const pem = require('pem');
const $ = require('jquery');
const https = require('https');
const express = require('express');
const ipcRenderer = require('electron').ipcRenderer;

/**
 * Opens an Oauth window with the appropriate URL then waits for the user
 * to log in. If the user logs in successfully, the code parameter will be
 * passed to the callback.
 *
 * @param showInternalURL Show internal (St. Jude) or external URL.
 * @param callback
 */
function waitForCode(
  showInternalURL: boolean,
  callback: any,
  dryrun: boolean = false
) {
  ui.createOauthWindow(showInternalURL, (window: any) => {
    if (!window) {
      return callback(new Error('Could not create window!'), null);
    }

    const certs: any = ipcRenderer.sendSync('sync/generate-selfsigned');
    let app = express();

    let server = https.createServer(
      {
        key: certs.private,
        cert: certs.cert,
      },
      app
    );

    window.on('close', () => {
      server.close();
      window = null;
    });

    app.get('/authcb', function(req: any, res: any) {
      // NOTE: Do not set window to null inside the next code block.
      // Here be dragons and mystical code errors that will cause you hours of
      // debugging pain.
      if (window) {
        window.close();
      }

      return callback(null, req.query.code);
    });

    server.listen(4433);
    console.log('Running OAuth listener on port 4433.');
  });
}

/**
 * Performs the full process of getting a token from DNAnexus using OAuth, both
 * for internal (St. Jude) or external users.
 *
 * @param showInternalURL Show internal (St. Jude) or external URL.
 * @param callback
 */
export function getToken(showInternalURL: boolean, callback: any) {
  waitForCode(showInternalURL, function(err: any, code: any) {
    if (err) return callback(err, null);
    $.post(
      'https://auth.dnanexus.com/oauth2/token',
      {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'https://localhost:4433/authcb',
      },
      (data: any) => {
        let authToken = data.access_token;
        return callback(null, authToken);
      }
    );
  });
}
