/**
 * @module dx
 * @description Methods for interacting with DNAnexus.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as utils from './utils';

import * as request from 'request';

import { Client } from '../../../vendor/dxjs';
import {
  DataObjectState,
  IDataObject,
} from '../../../vendor/dxjs/methods/system/findDataObjects';
import { IDescribeResult } from '../../../vendor/dxjs/methods/file/describe';
import {
  ProjectLevel,
  IFileUploadParameters,
} from '../../../vendor/dxjs/methods/system/findProjects';
import { SuccessCallback, ResultCallback, SJDTAFile } from './types';
import config from './config';

const progress = require('request-progress');
const expandHomeDir = require('expand-home-dir');

/**
 * Runs a command to determine if we are logged in to DNAnexus.
 *
 * @param token API token for DNAnexus API authentication.
 * @param cb True if we are logged in, false otherwise.
 */
export const loggedIn = async (token: string, cb: SuccessCallback<boolean>) => {
  const client = new Client(token);

  try {
    await client.system.whoami();
    cb(null, true);
  } catch (e) {
    cb(e, false);
  }
};

/**
 * Login to DNAnexus using an authentication token.
 *
 * Essentially no-op. See `oauth` to log in.
 *
 * @param token API token for DNAnexus API authentication.
 * @param cb True if we are logged in, false otherwise.
 */
export const login = (token: string, cb: SuccessCallback<boolean>) => {
  if (!token) {
    cb(new Error('token cannot be empty'), null);
  } else {
    loggedIn(token, cb);
  }
};

/**
 * Shim for existing logout.
 *
 * @param cb
 */
export const logout = (cb: SuccessCallback<boolean>) => {
  // noop
  cb(null, true);
};

/**
 * Describe a remote 'dx-item' as JSON.
 *
 * @param token API token for DNAnexus API authentication.
 * @param dxId The DNAnexus object identifier (ex: file-XXXXXX).
 * @param cb Callback function with remote object on success.
 **/
export const describeDXItem = async (
  token: string,
  dxId: string,
  cb: SuccessCallback<IDescribeResult>,
) => {
  if (!dxId) {
    cb(new Error('dxId cannot be empty'), null);
    return;
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

  try {
    let result = await client.file.describe(dxId, options);
    cb(null, result);
  } catch (e) {
    cb(e, null);
  }
};

interface QueryBoundary {
  id: string;
  project: string;
}

/**
 * List all of the files available in a DNAnexus project.
 *
 * @param token API token for DNAnexus API authentication.
 * @param projectId The DNAnexus project identifier (ex: project-XXXX).
 * @param allFiles List all files or just St. Jude Cloud associated ones.
 * @param cb Callback function with remote object on success.
 **/
export const listDownloadableFiles = async (
  token: string,
  projectId: string,
  allFiles: boolean,
  cb: SuccessCallback<IDataObject[]>,
) => {
  if (!projectId) {
    cb(new Error('projectId cannot be empty'), null);
    return;
  }

  const client = new Client(token);

  let files: IDataObject[] = [];
  let next: QueryBoundary | null = null;

  do {
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
      starting: next ? next : undefined,
    };

    try {
      let { results, next: boundary } = await client.system.findDataObjects(
        options,
      );
      files = files.concat(results);
      next = boundary as QueryBoundary | null;
    } catch (e) {
      cb(e, null);
    }
  } while (next);

  cb(null, files);
};

/**
 * Download a file from DNAnexus.
 *
 * @param token DNAnexus access token.
 * @param remoteFileId DNAnexus identifier of the file to be downloaded.
 *                     (ex: file-XXXX).
 * @param fileName Name of the downloaded file.
 * @param fileRawSize Size in bytes of the file, received from DNAnexus.
 * @param downloadLocation Folder for the downloaded file to reside.
 * @param updateCb To be called on each update to progress.
 * @param finishedCb To be called upon completion.
 * @returns The download request.
 */
export const downloadDxFile = async (
  token: string,
  remoteFileId: string,
  fileName: string,
  _fileRawSize: number,
  downloadLocation: string,
  updateCb: ResultCallback<number>,
  finishedCb: SuccessCallback<request.Response>,
): Promise<request.Request | null> => {
  const outputPath = expandHomeDir(path.join(downloadLocation, fileName));
  const fileId = remoteFileId.split(':')[1];

  const client = new Client(token);
  const writer = fs.createWriteStream(outputPath);

  try {
    const { url, headers } = await client.file.download(fileId);

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
  } catch (e) {
    finishedCb(e, null);
    return null;
  }
};

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
  private projectId: string;
  private src: string;
  private size: number;
  private progressCb: ResultCallback<number>;
  private finishedCb: SuccessCallback<{}>;

  private request: request.Request | null = null;
  private fileId = '';
  private bytesRead = 0;

  /**
   * Creates a new upload transfer.
   *
   * This does not start the upload.
   *
   * @param token DNAnexus access token.
   * @param projectId The ID of the container to upload to.
   * @param src The path the the local file to upload.
   * @param progressCb
   * @param finishedCb
   */
  public constructor(
    token: string,
    projectId: string,
    src: string,
    progressCb: ResultCallback<number>,
    finishedCb: SuccessCallback<{}>,
  ) {
    this.client = new Client(token);
    this.projectId = projectId;
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
   * @param dst The absolute path to upload the file to
   */
  public async start(dst: string) {
    const ranges = await this.prepare();

    const name = path.basename(this.src);

    const { id } = await this.client.file.new({
      folder: dst,
      name,
      parents: true,
      project: this.projectId,
      // tags: [config.NEEDS_ANALYSIS_TAG],
    });

    this.fileId = id;

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
  public async abort() {
    if (this.request) {
      this.request.abort();

      if (this.fileId) {
        try {
          await this.client.project.removeObjects(this.projectId, {
            objects: [this.fileId],
          });
        } catch (e) {
          this.finishedCb(e, null);
        }
      }
    }
  }

  private async prepare(): Promise<utils.IByteRange[]> {
    const { maximumPartSize } = await fileUploadParameters(
      this.client,
      this.projectId,
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
 * @param token DNAnexus access token.
 * @param file Local file object.
 * @param projectId The ID of the container to upload to.
 * @param progressCb
 * @param finishedCb
 * @param remoteFolder The directory to upload in the project to upload to.
 * @returns The upload transfer request.
 */
export const uploadFile = (
  token: string,
  file: SJDTAFile,
  projectId: string,
  progressCb: ResultCallback,
  finishedCb: SuccessCallback,
  remoteFolder: string = '/uploads',
): UploadTransfer => {
  const transfer = new UploadTransfer(
    token,
    projectId,
    file.path,
    progressCb,
    finishedCb,
  );

  transfer.start(remoteFolder);

  return transfer;
};

/**
 * Find and return projects the user can upload data to.
 *
 * @param token API token for DNAnexus API authentication.
 * @param allProjects Should we limit to St. Jude Cloud projects or list all projects?
 * @param cb If successful, all projects meeting the criteria of the options passed in.
 */
export const listProjects = async (
  token: string,
  allProjects: boolean,
  cb: SuccessCallback<any[]>,
) => {
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

  try {
    let { results } = await client.system.findProjects(options);

    const resultsCompat = results.map(project => {
      const { describe } = project;

      return {
        project_name: describe.name,
        dx_location: project.id,
        access_level: describe.level,
      };
    });

    cb(null, resultsCompat);
  } catch (e) {
    cb(e, []);
  }
};
