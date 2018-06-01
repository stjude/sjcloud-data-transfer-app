/**
 * @module dx
 * @description Methods for interacting with DNAnexus.
 */

import * as fs from 'fs';
import * as net from 'net';
import * as path from 'path';
import * as request from 'request';
const progress = require('request-progress');

import config from './config';
import * as utils from './utils';

import { Client } from '../../vendor/dxjs';
import { ResultCallback, SuccessCallback, SJDTAProject } from './types';
import { IDescribeResult } from '../../vendor/dxjs/methods/file/describe';
import {
  ProjectLevel,
  IFindProjectResult,
  IProject,
  IFileUploadParameters,
} from '../../vendor/dxjs/methods/system/findProjects';
import {
  IFindDataObjectsResult,
  DataObjectState,
  IDataObject,
} from '../../vendor/dxjs/methods/system/findDataObjects';
import { Request } from 'request';

export interface IRemoteLocalFilePair {
  localFilePath: string;
  remoteFilePath: {
    projectId?: string;
    fileId: string;
  };
}

export interface IFileRemoteProjectFolderMapping {
  localFilePath: string;
  projectId: string;
  folderName?: string;
}

export interface IMetadata {
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
  callback: SuccessCallback<boolean>,
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
  cb: SuccessCallback<IDescribeResult>,
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
  cb: SuccessCallback<IDataObject[]>,
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
    .then(({ results }: { results: any }) => {
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
 * @param file {IRemoteLocalFilePair} remote and local file paths.
 * @param updateCb {ResultCallback<number>} Used to periodically update file progress.
 * @param finishedCb {SuccessCallback<boolean>} Called at completion, true if successful,
 *   false if not.
 * @returns The download request.
 */
export function downloadFile(
  token: string,
  file: IRemoteLocalFilePair,
  updateCb: ResultCallback<number> | null,
  finishedCb: SuccessCallback<boolean>,
): Promise<Request | void> {
  const client = new Client(token);
  const writer = fs.createWriteStream(file.localFilePath);

  return client.file
    .download(file.remoteFilePath.fileId)
    .then(({ url, headers }: { url: string; headers: any }) => {
      const req = request(
        url,
        { headers },
        (error: any, response: request.Response, body: any) => {
          if (error) {
            finishedCb(error, null);
          } else {
            finishedCb(null, true);
          }
        },
      );

      req.on('abort', () => {
        finishedCb(
          new Error(`Upload of file ${file.localFilePath} aborted!`),
          null,
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
  cb: SuccessCallback<IProject[]>,
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
    tags: tagsToCheck.length > 0 ? { $or: tagsToCheck } : undefined,
  };

  client.system
    .findProjects(options)
    .then(({ results }: { results: IProject[] }) => {
      cb(null, results);
    })
    .catch((err: any) => {
      cb(err, null);
    });
}

/**
 * Returns the limits for the size and number of chunks that can be uploaded to
 * the given project.
 *
 * The object includes
 *
 *   * `minimumPartSize`: [number] In bytes, the min size of the chunk. This is
 *      required for all chunks but the final.
 *   * `maximumPartSize`: [number] In bytes, the max size of the chunk.
 *   * `maximumNumParts`: [number] The max number of chunks that can be uploaded.
 *   * `maximumFileSize`: [number] In bytes, the max size of the file, i.e., the
 *      sum of the sizes of all chunks.
 *   * `emptyLastPartAllowed`: [boolean] Whether an empty chunk (0 bytes) is
 *      allowed for the final chunk.
 *
 * @param client {Client} A preexisting Client for interacting with the DNAnexus API.
 * @param projectId {string} The DNAnexus project identifier (project-XXXXXXX).
 * @returns file upload parameters for the given project
 */
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

/**
 * A transfer for a file being uploaded to DNAnexus.
 *
 * Large file transfers are not supported DNAnexus. This requires any large
 * files to be uploaded in _chunks_. Given a local file, chunking and endpoint
 * uploading are handled internally by `UploadTransfer`.
 */
class UploadTransfer {
  private client: Client;
  private src: string;
  private size: number;
  private progressCb: ResultCallback<number>;
  private finishedCb: SuccessCallback<{}>;

  private request: Request | null = null;
  private bytesRead = 0;

  /**
   * Creates a new upload transfer.
   *
   * This does not start the upload.
   *
   * @param token
   * @param src
   * @param progressCb
   * @param finishedCb
   */
  public constructor(
    token: string,
    src: string,
    progressCb: ResultCallback<number>,
    finishedCb: SuccessCallback<{}>,
  ) {
    this.client = new Client(token);
    this.src = src;
    this.size = fs.statSync(this.src).size;
    this.progressCb = progressCb;
    this.finishedCb = finishedCb;
  }

  /**
   * Initiates a file upload transfer.
   *
   * The destination can be any path in the project. If it does not exist, it
   * and its parents will automatically be created.
   *
   * @param projectId The ID of the DNAnexus project to upload the file
   * @param dst The absolute path to upload the file to
   */
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

  /**
   * Aborts a request in progress.
   *
   * Any data left in the file stream will be dropped.
   */
  public abort() {
    if (this.request) {
      this.request.abort();
    }
  }

  private async prepare(projectId: string): Promise<utils.IByteRange[]> {
    const { maximumPartSize } = await fileUploadParameters(
      this.client,
      projectId,
    );

    return utils.byteRanges(this.size, maximumPartSize);
  }

  private async transfer(
    id: string,
    i: number,
    start: number,
    end: number,
  ): Promise<{}> {
    const reader = fs.createReadStream(this.src, { start, end });

    // The offsets are 0-indexed.
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

      // Instead of listening to each file stream, use the raw socket to track
      // how many bytes were sent.
      this.request.on('drain', () => {
        // `request.req` is technically not public API, but it's guaranteed to
        // be available if the request successfully started.
        const r: any = this.request;
        const connection: net.Socket = r.req;
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
 * @param token {string} Token to identify ourselves to the API.
 * @param projectId {string} DNAnexus ID of projectId being uploaded to.
 * @param file {IFileRemoteProjectFolderMapping} Local file to remote folder pair.
 * @param progressCb {ResultCallback} Periodically called with updates on the
 *                                    upload progress.
 * @param finishedCb {SuccessCallback} Called on successful upload or failure.
 * @returns {UploadTransfer} The upload transfer request.
 */
export function uploadFile(
  token: string,
  file: IFileRemoteProjectFolderMapping,
  progressCb: ResultCallback<number>,
  finishedCb: SuccessCallback<{}>,
): UploadTransfer {
  const transfer = new UploadTransfer(
    token,
    file.localFilePath,
    progressCb,
    finishedCb,
  );

  if (!file.folderName) {
    file.folderName = '/uploads';
  }

  transfer.start(file.projectId, file.folderName);
  return transfer;
}
