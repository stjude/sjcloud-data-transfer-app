/**
 * @module dx
 * @description Methods for interacting with DNAnexus.
 */

import {execSync} from 'child_process';

import {Request} from 'request';

import {Client} from '../../../vendor/dxjs';
import {
  SuccessCallback,
  ResultCallback,
  SJDTAFile,
  SJDTAProject,
} from './types';

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as utils from './utils';
import * as logging from './logging';

import config from './config';

const request = require('request');
const progress = require('request-progress');
const async = require('async');
const expandHomeDir = require('expand-home-dir');
const platform = os.platform();

/**********************************************************
 *                DX-Toolkit Functionality                *
 **********************************************************/

interface IMetadata {
  size: number;
  md5: string;
}

/**
 * Runs a command to determine if we are logged in to DNAnexus.
 *
 * @param token
 * @param callback
 */
export async function loggedIn(token: string, callback: SuccessCallback) {
  const client = new Client(token);

  try {
    await client.system.whoami();
    callback(null, true);
  } catch (e) {
    callback(e, false);
  }
}

/**
 * Login to DNAnexus using an authentication token
 * via the dx command line utility.
 *
 * @param token Authentication token
 * @param callback
 */
export function login(token: string, callback: SuccessCallback) {
  if (!token) {
    return callback(new Error('Token cannot be null/empty!'), null);
  }

  loggedIn(token, callback);
}

/**
 * Logout of DNAnexus via the dx command line utility.
 *
 * @param callback
 */
export function logout(callback: SuccessCallback, dryrun: boolean = false) {
  // @FIXME
  callback(null, true);
}

/**
 * Describe a 'dx-item' as JSON via the dx command* line utility.
 *
 * @param token
 * @param dnanexusId The DNAnexus object identifier (ex: file-XXXXXX).
 * @param callback
 **/
export function describeDXItem(
  token: string,
  dnanexusId: string,
  callback: SuccessCallback
) {
  if (!dnanexusId) {
    const error = new Error('Dx-identifier cannot be null/empty!');
    callback(error, null);
  }

  const client = new Client(token);

  const options = {
    fields: {
      dataUsage: true,
      properties: true,
      tags: true,
    },
  };

  client.file
    .describe(dnanexusId, options)
    .then((result: any) => {
      callback(null, result);
    })
    .catch((err: any) => {
      callback(err, null);
    });
}

/**
 * List all of the files available for download in a DNAnexus project.
 *
 * @param token
 * @param projectId The DNAnexus project identifier (ex: project-XXXX).
 * @param allFiles List all files or just St. Jude Cloud associated ones.
 * @param callback
 **/
export function listDownloadableFiles(
  token: string,
  projectId: string,
  allFiles: boolean,
  callback: SuccessCallback
) {
  if (!projectId) {
    const error = new Error('Dx-project cannot be null/empty!');
    callback(error, null);
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
    state: 'closed',
    tags: !allFiles ? config.DOWNLOADABLE_TAG : undefined,
  };

  client.system
    .findDataObjects(options)
    .then(({results}: {results: any}) => {
      callback(null, results);
    })
    .catch((err: any) => {
      callback(err, null);
    });
}

/**
 * Download a file from DNAnexus.
 *
 * @param token
 * @param remoteFileId DNAnexus identifier of the file to be downloaded.
 *                     (ex: file-XXXX).
 * @param fileName Name of the downloaded file.
 * @param fileRawSize Size in bytes of the file, received from DNAnexus.
 * @param downloadLocation Folder for the downloaded file to reside.
 * @param updateCb To be called on each update to progress.
 * @param finishedCb To be called upon completion.
 * @return the download request
 */
export function downloadDxFile(
  token: string,
  remoteFileId: string,
  fileName: string,
  _fileRawSize: number,
  downloadLocation: string,
  updateCb: ResultCallback,
  finishedCb: SuccessCallback
): Promise<Request> {
  const outputPath = expandHomeDir(path.join(downloadLocation, fileName));
  const fileId = remoteFileId.split(':')[1];

  const client = new Client(token);
  const writer = fs.createWriteStream(outputPath);

  return client.file
    .download(fileId)
    .then(({url, headers}: {url: string; headers: any}) => {
      const req = request(url, {headers}, (error: any, response: any) => {
        if (error) {
          finishedCb(error, null);
        } else {
          finishedCb(null, response);
        }
      });

      req.on('abort', () => {
        finishedCb(new Error('upload aborted'), null);
      });

      progress(req).on('progress', (state: any) => {
        updateCb(state.percent * 100);
      });

      req.pipe(writer);

      return req;
    })
    .catch((err: any) => {
      finishedCb(err, null);
    });
}

const metadata = async (pathname: string): Promise<IMetadata> => {
  const {size} = fs.statSync(pathname);
  const md5 = await utils.computeMd5(pathname);
  return {md5, size};
};

/**
 * Uploads a file to a DNAnexus project via the dx command line utility.
 *
 * @param token
 * @param file File object from the Vuex store.
 * @param projectId DNAnexus ID of projectId being uploaded to.
 * @param progressCb
 * @param finishedCb
 * @return the upload request
 */
export async function uploadFile(
  token: string,
  file: SJDTAFile,
  projectId: string,
  progressCb: ResultCallback,
  finishedCb: SuccessCallback,
  remoteFolder: string = '/uploads'
): Promise<Request> {
  const basename: string = path.basename(file.path.trim());
  const dxRemotePath: string = `${projectId}:${remoteFolder}/${basename}`;

  const client = new Client(token);

  const {id} = await client.file.new({
    folder: remoteFolder,
    name: basename,
    parents: true,
    project: projectId,
    // tags: [config.NEEDS_ANALYSIS_TAG],
  });

  const attributes = await metadata(file.path);

  let bytesRead = 0;
  const {size} = attributes;

  const reader = fs.createReadStream(file.path);

  const {url, headers} = await client.file.upload(id, attributes);

  const req = request(
    url,
    {body: reader, headers, method: 'PUT'},
    async (error: any, response: any) => {
      if (error) {
        finishedCb(error, response);
      } else {
        await client.file.close(id);
        finishedCb(error, response);
      }
    }
  );

  req.on('drain', () => {
    const {bytesWritten} = req.req.connection;
    const percent = bytesWritten / size * 100;
    progressCb(percent);
  });

  req.on('abort', () => {
    finishedCb(new Error('upload aborted'), null);
  });

  return req;
}

/**
 * Find and return projects the user can upload data to.
 *
 * @param token
 * @param allProjects should we limit to St. Jude Cloud
 *                    projects or list all projects?
 * @param callback
 */
export function listProjects(
  token: string,
  allProjects: boolean,
  callback: SuccessCallback,
  dryrun: boolean = false
) {
  let tagsToCheck = [];
  let projects: SJDTAProject[] = [];

  if (!allProjects) {
    tagsToCheck = [config.TOOL_PROJECT_TAG, config.DATA_PROJECT_TAG];
  }

  const client = new Client(token);

  const options = {
    describe: {
      name: true,
      level: true,
    },
    level: 'UPLOAD',
    tags: tagsToCheck.length > 0 ? {$or: tagsToCheck} : undefined,
  };

  client.system
    .findProjects(options)
    .then(({results}: {results: any}) => {
      const resultsCompat = results.map((project: any) => {
        const {describe} = project;

        return {
          project_name: describe.name,
          dx_location: project.id,
          access_level: describe.level,
        };
      });

      callback(null, resultsCompat);
    })
    .catch((err: any) => {
      callback(err, []);
    });
}
