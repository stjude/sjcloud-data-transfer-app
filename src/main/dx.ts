/**
 * @module dx
 * @description Methods for interacting with DNAnexus.
 */

import * as fs from 'fs';
import * as request from 'request';
// import * as progress from 'request-progress';
const progress = require('request-progress');

import config from './config';

import {Client} from '../../vendor/dxjs';
import {ResultCallback, SuccessCallback, SJDTAProject} from './types';
import {IDescribeResult} from '../../vendor/dxjs/methods/file/describe';
import {
  ProjectLevel,
  IFindProjectResult,
  IProject,
} from '../../vendor/dxjs/methods/system/findProjects';
import {
  IFindDataObjectsResult,
  DataObjectState,
  IDataObject,
} from '../../vendor/dxjs/methods/system/findDataObjects';
import {Request} from 'request';

export interface RemoteLocalFilePair {
  localFilePath: string;
  remoteFilePath: {
    projectId?: string;
    fileId: string;
  };
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
 * @param cb {SuccessCallback<IDescribeResult>} Callback function with remote
 *   object on success.
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

/**
 * List all of the files available in a DNAnexus project.
 *
 * @param token {string} API token for DNAnexus API authentication.
 * @param projectId {string} The DNAnexus project identifier (ex: project-XXXX).
 * @param allFiles {boolean} List all files or just St. Jude Cloud associated ones.
 * @param cb {SuccessCallback<IDataObject[]>} Callback function with remote
 *   object on success.
 **/
export function listFiles(
  token: string,
  projectId: string,
  allFiles: boolean,
  cb: SuccessCallback<IDataObject[]>
) {
  if (!projectId) {
    return cb(new Error('dx-project cannot be null/empty!'), null);
  }

  const client = new Client(token);

  const options = {
    describe: {
      fields: {
        name: true,
        size: true,
      },
    },
    scope: {
      project: projectId,
    },
    state: DataObjectState.Closed,
    tags: !allFiles ? config.DOWNLOADABLE_TAG : undefined,
  };

  client.system
    .findDataObjects(options)
    .then(({results}: {results: any}) => {
      cb(null, results);
    })
    .catch((err: any) => {
      cb(err, null);
    });
}

/**
 * Download a file from DNAnexus.
 *
 * @param token {string} API token for DNAnexus API authentication.
 * @param file {RemoteLocalFilePair} remote and local file paths.
 * @param updateCb {ResultCallback<number>} Used to periodically update file progress.
 * @param finishedCb {SuccessCallback<boolean>} Called at completion, true if successful,
 *   false if not.
 * @returns The download request.
 */
export function downloadFile(
  token: string,
  file: RemoteLocalFilePair,
  updateCb: ResultCallback<number> | null,
  finishedCb: SuccessCallback<boolean>
): Promise<Request | void> {
  const client = new Client(token);
  const writer = fs.createWriteStream(file.localFilePath);

  return client.file
    .download(file.remoteFilePath.fileId)
    .then(({url, headers}: {url: string; headers: any}) => {
      const req = request(
        url,
        {headers},
        (error: any, response: request.Response, body: any) => {
          if (error) {
            finishedCb(error, null);
          } else {
            finishedCb(null, true);
          }
        }
      );

      req.on('abort', () => {
        finishedCb(
          new Error(`Upload of file ${file.localFilePath} aborted!`),
          null
        );
      });

      progress(req).on('progress', (state: any) => {
        if (updateCb) {
          updateCb(state.percent * 100);
        }
      });

      req.pipe(writer);

      return req;
    })
    .catch((err: any) => {
      finishedCb(err, null);
    });
}

/**
 * Find and return projects the user can upload data to.
 *
 * @param token {string} API token for DNAnexus API authentication.
 * @param allProjects {boolean} Should we limit to St. Jude Cloud projects
 *   or list all projects?
 * @param cb {SuccessCallback<IProject[]>} If successful, all projects meeting
 *   the criteria of the options passed in.
 */
export function listProjects(
  token: string,
  allProjects: boolean,
  cb: SuccessCallback<IProject[]>
) {
  let tagsToCheck: string[] = [];

  if (!allProjects) {
    tagsToCheck = [config.TOOL_PROJECT_TAG, config.DATA_PROJECT_TAG];
  }

  const client = new Client(token);

  const options = {
    describe: {
      fields: {
        name: true,
        level: true,
      },
    },
    level: ProjectLevel.Upload,
    tags: tagsToCheck.length > 0 ? {$or: tagsToCheck} : undefined,
  };

  client.system
    .findProjects(options)
    .then(({results}: {results: IProject[]}) => {
      cb(null, results);
    })
    .catch((err: any) => {
      cb(err, null);
    });
}
