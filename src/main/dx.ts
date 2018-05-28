/**
 * @module dx
 * @description Methods for interacting with DNAnexus.
 */

import {Client} from '../../vendor/dxjs';
import {SuccessCallback} from './types';
import {IDescribeResult} from '../../vendor/dxjs/methods/file/describe';

export interface RemoteLocalFilePair {
  localFile: string;
  remoteFile: string;
}

interface IMetadata {
  size: number;
  md5: string;
}

/**
 * Runs a command to determine if we are logged in to DNAnexus.
 *
 * @param token {string} API token for DNAnexus API authentication.
 * @param callback {SuccessCallback<boolean>} True if we are logged in, false otherwise.
 */
export async function loggedIn(
  token: string,
  callback: SuccessCallback<boolean>
) {
  const client = new Client(token);

  try {
    await client.system.whoami();
    callback(null, true);
  } catch (e) {
    callback(e, false);
  }
}

/**
 * Login to DNAnexus using an authentication token.
 *
 * @param token {string} API token for DNAnexus API authentication.
 * @param callback {SuccessCallback<boolean>} True if we are logged in, false otherwise.
 */
export function login(token: string, callback: SuccessCallback<boolean>) {
  if (!token) {
    callback(new Error('Token cannot be null/empty!'), null);
  } else {
    loggedIn(token, callback);
  }
}

/**
 * Describe a remote 'dx-item' as JSON.
 *
 * @param token {string} API token for DNAnexus API authentication.
 * @param dxId {string} The DNAnexus object identifier (ex: file-XXXXXX).
 * @param cb {SuccessCallback<any>} Callback function with remote object on success.
 **/

export function describe(
  token: string,
  dxId: string,
  cb: SuccessCallback<IDescribeResult>
) {
  if (!dxId) {
    return cb(Error('dxId cannot be null/empty!'), null);
  }

  const client = new Client(token);
  const options = {
    fields: {
      // Both data usages add up for project sizes.
      dataUsage: true,
      sponsoredDataUsage: true,
      size: true,
      properties: true,
      tags: true,
    },
  };

  client.file
    .describe(dxId, options)
    .then((result: IDescribeResult) => {
      cb(null, result);
    })
    .catch((err: Error) => {
      cb(err, null);
    });
}
