import Client from '.';
import { IAddTagsOptions, IAddTagsResult } from '../methods/file/addTags';
import { ICloseResult } from '../methods/file/close';
import { IDescribeOptions, IDescribeResult } from '../methods/file/describe';
import { IDownloadOptions, IDownloadResult } from '../methods/file/download';
import { INewOptions, INewResult } from '../methods/file/new';
import { IUploadOptions, IUploadResult } from '../methods/file/upload';
declare class FileClient {
  private client;
  constructor(client: Client);
  addTags(fileId: string, options: IAddTagsOptions): Promise<IAddTagsResult>;
  close(fileId: string): Promise<ICloseResult>;
  describe(fileId: string, options: IDescribeOptions): Promise<IDescribeResult>;
  download(
    fileId: string,
    options?: IDownloadOptions,
  ): Promise<IDownloadResult>;
  new(options: INewOptions): Promise<INewResult>;
  upload(fileId: string, options: IUploadOptions): Promise<IUploadResult>;
}
export default FileClient;
