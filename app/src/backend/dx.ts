/**
 * @module dx
 * @description Methods for installing dx-toolkit and interacting with DNAnexus.
 */

import {execSync} from 'child_process';

import {Request} from 'request';

import {Client} from '../../../vendor/dxjs';
import {
  SuccessCallback,
  ResultCallback,
  SJDTAFile,
  SJDTAProject,
  DXDownloadInfo,
} from './types';

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as utils from './utils';
import * as logging from './logging';

const request = require('request');
const progress = require('request-progress');
const async = require('async');
const expandHomeDir = require('expand-home-dir');
const config = require('../../../config.json');
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
 * @param {SuccessCallback} callback
 * @param dryrun Return the command that would have been run as a string.
 * @returns ChildProcess or string depending on the value of 'dryrun'.
 */
export function loggedIn(
  callback: SuccessCallback,
  dryrun: boolean = false
): any {
  const cmd = 'dx whoami';
  return dryrun ? cmd : utils.runCommand(cmd, callback);
}

/**
 * Login to DNAnexus using an authentication token
 * via the dx command line utility.
 *
 * @param token Authentication token
 * @param callback
 * @param dryrun Return the command that would have been run as a string.
 * @returns ChildProcess or string depending on the value of 'dryrun'.
 */
export function login(
  token: string,
  callback: SuccessCallback,
  dryrun: boolean = false
): any {
  if (!token) {
    return callback(new Error('Token cannot be null/empty!'), null);
  }
  const cmd = `dx login --token ${token} --noprojects`;
  return dryrun ? cmd : utils.runCommand(cmd, callback);
}

/**
 * Logout of DNAnexus via the dx command line utility.
 *
 * @param callback
 * @param dryrun Return the command that would have been run as a string.
 * @returns {any} ChildProcess or string depending on the value of 'dryrun'.
 */
export function logout(
  callback: SuccessCallback,
  dryrun: boolean = false
): any {
  const cmd = 'dx logout';
  return dryrun ? cmd : utils.runCommand(cmd, callback);
}

/**
 * Describe a 'dx-item' as JSON via the dx command* line utility.
 *
 * @param dnanexusId The DNAnexus object identifier (ex: file-XXXXXX).
 * @param callback
 * @param dryrun Return the command that would have been run as a string.
 * @returns {any} ChildProcess or string depending on the value of 'dryrun'.
 **/
export function describeDXItem(
  dnanexusId: string,
  callback: SuccessCallback,
  dryrun: boolean = false
): any {
  if (!dnanexusId) {
    const error = new Error('Dx-identifier cannot be null/empty!');
    return callback(error, null);
  }

  let cmd = `dx describe ${dnanexusId} --json`;
  return dryrun
    ? cmd
    : utils.runCommand(cmd, (err: any, stdout: any) => {
        if (!stdout) {
          callback(err, stdout);
          return;
        }
        callback(err, JSON.parse(stdout));
      });
}

/**
 * Checks if there's at least one project the user can upload data to.
 *
 * @param {SuccessCallback} callback
 * @param {boolean} dryrun Return the command that would have been run as a string.
 * @param {string} overridePlatform Override the platform string with this value.
 */
export function checkProjectAccess(
  callback: SuccessCallback,
  dryrun: boolean = false,
  overridePlatform: string = null
): any {
  let cmd = '';
  let platformToUse = overridePlatform || platform;

  if (platformToUse === 'linux' || platformToUse === 'darwin') {
    cmd = "echo '0' | dx select --level UPLOAD";
  } else if (platformToUse === 'win32') {
    cmd = '"echo 0 | dx select --level UPLOAD"';
  } else throw new Error(`Unrecognized platform: '${platformToUse}'.`);

  return dryrun ? cmd : utils.runCommand(cmd, callback);
}

/**
 * List all of the files available for download in a DNAnexus project.
 *
 * @param projectId The DNAnexus project identifier (ex: project-XXXX).
 * @param allFiles List all files or just St. Jude Cloud associated ones.
 * @param callback
 * @param dryrun Return the command that would have been run as a string.
 * @returns {any} ChildProcess or string depending on the value of 'dryrun'.
 **/
export function listDownloadableFiles(
  token: string,
  projectId: string,
  allFiles: boolean,
  callback: SuccessCallback,
  dryrun: boolean = false
): any {
  if (!projectId) {
    const error = new Error('Dx-project cannot be null/empty!');
    return callback(error, null);
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
 * @param remoteFileId DNAnexus identifier of the file to be downloaded.
 *                     (ex: file-XXXX).
 * @param fileName Name of the downloaded file.
 * @param fileRawSize Size in bytes of the file, received from DNAnexus.
 * @param downloadLocation Folder for the downloaded file to reside.
 * @param updateCb To be called on each update to progress.
 * @param finishedCb To be called upon completion.
 * @return ChildProcess
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
 * @param file File object from the Vuex store.
 * @param projectId DNAnexus ID of projectId being uploaded to.
 * @param progressCb
 * @param finishedCb
 * @return ChildProcess
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
  const dxRemotePath: string = `${projectId}: ${remoteFolder} /${basename}`;

  const client = new Client(token);

  const {id} = await client.file.new({
    folder: remoteFolder,
    name: basename,
    parents: true,
    project: projectId,
    // tags: [config.NEEDS_ANALYSIS_TAG],
  });

  const reader = fs.createReadStream(file.path);
  const attributes = await metadata(file.path);

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

  return req;
}

/**
 * Utility method to parse out projects from a 'dx find projects' command.
 *
 * @param stdout STDOUT from a 'dx find projects' command.
 */
function parseDxProjects(stdout: string): SJDTAProject[] {
  let results: SJDTAProject[] = [];

  // forEach is synchronous
  stdout.split('\n').forEach((el: string) => {
    if (el.trim().length <= 0) return;

    let _: string;
    let name: string;
    let dxLocation: string;
    let accessLevel: string;

    [dxLocation, name, accessLevel, _] = el.split('\t');
    if (accessLevel) {
      results.push({
        project_name: name,
        dx_location: dxLocation,
        access_level: accessLevel,
      });
    }
  });

  return results;
}
/**
 * Find and return projects the user can upload data to.
 *
 * @param allProjects should we limit to St. Jude Cloud
 *                    projects or list all projects?
 * @param callback
 * @param dryrun Return a list of commands that would be run as string.
 * @returns List of projects or list of strings based on 'dryrun'.
 */
export function listProjects(
  token: string,
  allProjects: boolean,
  callback: SuccessCallback,
  dryrun: boolean = false
): void {
  // Setting tagsToCheck = [''] will run one command that does not filter any
  // tags. This is equivalent to checking all projects, not just SJCloud ones.
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
    tags: tagsToCheck.length > 0 ? tagsToCheck : undefined,
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
