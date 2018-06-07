/**
 * @module dx
 * @description Methods for interacting with DNAnexus.
 */

import { execSync } from 'child_process';

import { Request } from 'request';

import { Client } from '../../../vendor/dxjs';
import { IDescribeOptions } from '../../../vendor/dxjs/methods/file/describe';
import { DataObjectState } from '../../../vendor/dxjs/methods/system/findDataObjects';
import {
  ProjectLevel,
  IFileUploadParameters,
} from '../../../vendor/dxjs/methods/system/findProjects';
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
  callback: SuccessCallback,
) {
  if (!dnanexusId) {
    const error = new Error('Dx-identifier cannot be null/empty!');
    callback(error, null);
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
  callback: SuccessCallback,
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
    state: DataObjectState.Closed,
    tags: !allFiles ? config.DOWNLOADABLE_TAG : undefined,
  };

  client.system
    .findDataObjects(options)
    .then(({ results }: { results: any }) => {
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
  finishedCb: SuccessCallback,
): Promise<Request> {
  const outputPath = expandHomeDir(path.join(downloadLocation, fileName));
  const fileId = remoteFileId.split(':')[1];

  const client = new Client(token);
  const writer = fs.createWriteStream(outputPath);

  return client.file
    .download(fileId)
    .then(({ url, headers }: { url: string; headers: any }) => {
      const req = request(url, { headers }, (error: any, response: any) => {
        if (error) {
          finishedCb(error, null);
        } else {
          finishedCb(null, response);
        }
      });

      req.on('abort', () => {
        finishedCb(new Error('download aborted'), null);
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

const fileUploadParameters = async (
  client: Client,
  projectId: string,
): Promise<IFileUploadParameters> => {
  const result = await client.project.describe(projectId, {
    fields: { fileUploadParameters: true },
  });

  const { fileUploadParameters: params } = result;

  if (!params) {
    throw new Error('missing file upload parameters');
  }

  return params;
};

class UploadTransfer {
  private client: Client;
  private src: string;
  private size: number;
  private progressCb: ResultCallback;
  private finishedCb: SuccessCallback;

  private request: Request | null = null;
  private bytesRead = 0;

  public constructor(
    token: string,
    src: string,
    progressCb: ResultCallback,
    finishedCb: SuccessCallback,
  ) {
    this.client = new Client(token);
    this.src = src;
    this.size = fs.statSync(this.src).size;
    this.progressCb = progressCb;
    this.finishedCb = finishedCb;
  }

  public async prepare(projectId: string): Promise<utils.IByteRange[]> {
    const { maximumPartSize } = await fileUploadParameters(
      this.client,
      projectId,
    );

    return utils.byteRanges(this.size, maximumPartSize);
  }

  public async start(projectId: string, dst: string) {
    const ranges = await this.prepare(projectId);

    const name = path.basename(this.src);

    const { id } = await this.client.file.new({
      folder: dst,
      name,
      parents: true,
      project: projectId,
      // tags: [config.NEEDS_ANALYSIS_TAG],
    });

    for (let i = 0; i < ranges.length; i++) {
      const { start, end } = ranges[i];
      await this.transfer(id, i + 1, start, end);
    }

    await this.client.file.close(id);

    this.finishedCb(null, {});
  }

  public abort() {
    if (request) {
      request.abort();
    }
  }

  private async transfer(
    id: string,
    i: number,
    start: number,
    end: number,
  ): Promise<{}> {
    const reader = fs.createReadStream(this.src, { start, end });

    const size = end - start + 1;
    const md5 = await utils.md5Sum(this.src, start, end);

    const { url, headers } = await this.client.file.upload(id, {
      index: i,
      md5,
      size,
    });

    return new Promise(resolve => {
      this.request = request(
        url,
        { body: reader, headers, method: 'PUT' },
        async (error: any, response: any) => {
          if (error) {
            this.finishedCb(error, null);
          } else {
            this.bytesRead += size;
            resolve();
          }
        },
      );

      this.request.on('drain', () => {
        const r: any = this.request;
        const { bytesWritten } = r.req.connection;
        const percent = (this.bytesRead + bytesWritten) / this.size * 100;
        this.progressCb(percent);
      });

      this.request.on('abort', () => {
        this.finishedCb(new Error('upload aborted'), null);
      });
    });
  }
}

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
export function uploadFile(
  token: string,
  file: SJDTAFile,
  projectId: string,
  progressCb: ResultCallback,
  finishedCb: SuccessCallback,
  remoteFolder: string = '/uploads',
): UploadTransfer {
  const transfer = new UploadTransfer(token, file.path, progressCb, finishedCb);
  transfer.start(projectId, remoteFolder);
  return transfer;
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
  dryrun: boolean = false,
) {
  let tagsToCheck: string[] = [];
  let projects: SJDTAProject[] = [];

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
    tags: tagsToCheck.length > 0 ? { $or: tagsToCheck } : undefined,
  };

  client.system
    .findProjects(options)
    .then(({ results }: { results: any }) => {
      const resultsCompat = results.map((project: any) => {
        const { describe } = project;

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
