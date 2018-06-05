/**
 * @module oauth
 * @description Contains all OAuth functionality for the application.
 */

import * as https from 'https';

import { ipcRenderer } from 'electron';
import * as express from 'express';
import * as $ from 'jquery';

import { SuccessCallback } from './types';
import { selfSigned, ICertificate } from './utils';
import { createOAuthWindow } from './window';

const PORT = 4433;
const DX_TOKEN_ENDPOINT = 'https://auth.dnanexus.com/oauth2/token';

interface ITokenResult {
  access_token: string;
}

const generateCerts = (): Promise<ICertificate> => {
  return new Promise((resolve, reject) => {
    selfSigned((err, certs) => {
      if (err || !certs) {
        reject(err);
      } else {
        resolve(certs);
      }
    });
  });
};

/**
 * Opens a browser window to log in to DNAnexus.
 *
 * @param showInternalURL Whether to use St. Jude SSO (true) or DNAnexus (false).
 * @param callback
 */
export const waitForCode = (
  showInternalURL: boolean,
  cb: SuccessCallback<string>,
) => {
  createOAuthWindow(showInternalURL, async (err, window) => {
    if (!window) {
      cb(new Error('Could not create window!'), null);
      return;
    }

    let certs: ICertificate;

    try {
      certs = await generateCerts();
    } catch (e) {
      cb(e, null);
      return;
    }

    let app = express();

    let server = https.createServer(
      {
        key: certs.private,
        cert: certs.cert,
      },
      app,
    );

    window.on('close', () => {
      server.close();
      window = null;
    });

    app.get('/authcb', function(req) {
      // NOTE: Do not set window to null inside the next code block.
      // Here be dragons and mystical code errors that will cause you hours of
      // debugging pain.
      if (window) {
        window.close();
      }

      return cb(null, req.query.code);
    });

    server.listen(PORT);
    console.log(`Running OAuth listener on port ${PORT}.`);
  });
};

/**
 * Hooks to a browser window waiting for an access token from DNAnexus.
 *
 * @param showInternalURL Whether to use St. Jude SSO (true) or DNAnexus (false).
 * @param cb
 */
export const getToken = (
  showInternalURL: boolean,
  cb: SuccessCallback<string>,
) => {
  ipcRenderer.on(
    'oauth:receive-token',
    (_event: Electron.Event, err: Error | null, code: string | null) => {
      if (err || !code) {
        cb(err, null);
        return;
      }

      const payload = {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'https://localhost:4433/authcb',
      };

      $.post(DX_TOKEN_ENDPOINT, payload)
        .done((data: ITokenResult) => {
          const { access_token: accessToken } = data;
          cb(null, accessToken);
        })
        .fail((_jqxhr, textStatus, errorThrown) => {
          const message = `${textStatus}: ${errorThrown}`;
          cb(new Error(message), null);
        });
    },
  );

  ipcRenderer.send('oauth:request-token', showInternalURL);
};
