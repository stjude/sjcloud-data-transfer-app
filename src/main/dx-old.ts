/**
 * @module dx
 * @description Methods for interacting with DNAnexus.
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {execSync} from 'child_process';

import {Request} from 'request';

import * as utils from './utils';
import * as logging from './logging';
import config from './config';
import {RemoteLocalFilePair} from './queue';
import {Client} from '../../vendor/dxjs';
import {IDescribeOptions} from '../../vendor/dxjs/methods/file/describe';
import {DataObjectState} from '../../vendor/dxjs/methods/system/findDataObjects';
import {
  ProjectLevel,
  IFileUploadParameters,
} from '../../vendor/dxjs/methods/system/findProjects';
import {
  SuccessCallback,
  ResultCallback,
  SJDTAFile,
  SJDTAProject,
} from './types';

const request = require('request');
const progress = require('request-progress');
const async = require('async');
const expandHomeDir = require('expand-home-dir');
const platform = os.platform();

/**
 * Logout of DNAnexus via the dx command line utility.
 *
 * @param callback
 */
export function logout(callback: SuccessCallback, dryrun: boolean = false) {
  // @FIXME
  callback(null, true);
}

const fileUploadParameters = async (
  client: Client,
  projectId: string
): Promise<IFileUploadParameters> => {
  const result = await client.project.describe(projectId, {
    fields: {fileUploadParameters: true},
  });

  const {fileUploadParameters: params} = result;

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
    finishedCb: SuccessCallback
  ) {
    this.client = new Client(token);
    this.src = src;
    this.size = fs.statSync(this.src).size;
    this.progressCb = progressCb;
    this.finishedCb = finishedCb;
  }

  public async prepare(projectId: string): Promise<utils.IByteRange[]> {
    const {maximumPartSize} = await fileUploadParameters(
      this.client,
      projectId
    );

    return utils.byteRanges(this.size, maximumPartSize);
  }

  public async start(projectId: string, dst: string) {
    const ranges = await this.prepare(projectId);

    const name = path.basename(this.src);

    const {id} = await this.client.file.new({
      folder: dst,
      name,
      parents: true,
      project: projectId,
      // tags: [config.NEEDS_ANALYSIS_TAG],
    });

    for (let i = 0; i < ranges.length; i++) {
      const {start, end} = ranges[i];
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
    end: number
  ): Promise<{}> {
    const reader = fs.createReadStream(this.src, {start, end});

    const size = end - start + 1;
    const md5 = await utils.md5Sum(this.src, start, end);

    const {url, headers} = await this.client.file.upload(id, {
      index: i,
      md5,
      size,
    });

    return new Promise(resolve => {
      this.request = request(
        url,
        {body: reader, headers, method: 'PUT'},
        async (error: any, response: any) => {
          if (error) {
            this.finishedCb(error, null);
          } else {
            this.bytesRead += size;
            resolve();
          }
        }
      );

      this.request.on('drain', () => {
        const r: any = this.request;
        const {bytesWritten} = r.req.connection;
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
 * @param file {RemoteLocalFilePair} Local and remote file name pair.
 * @param progressCb {ResultCallback} Periodically called with updates on the
 *                                    upload progress.
 * @param finishedCb {SuccessCallback} Called on successful upload or failure.
 * @returns {UploadTransfer} The upload transfer request.
 */
export function uploadFile(
  token: string,
  projectId: string,
  file: RemoteLocalFilePair,
  progressCb: ResultCallback,
  finishedCb: SuccessCallback,
  remoteFolder: string = '/uploads'
): UploadTransfer {
  const transfer = new UploadTransfer(
    token,
    file.local_file,
    progressCb,
    finishedCb
  );
  transfer.start(projectId, remoteFolder);
  return transfer;
}
