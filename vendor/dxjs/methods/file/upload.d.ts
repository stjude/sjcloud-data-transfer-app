import {Timestamp} from '../..';
import Client from '../../client';
export interface IUploadOptions {
  size: number;
  md5: string;
  index?: number;
}
export interface IUploadResult {
  url: string;
  expires: Timestamp;
  headers: {
    [key: string]: string;
  };
}
declare const upload: (
  client: Client,
  fileId: string,
  options: IUploadOptions
) => Promise<IUploadResult>;
export default upload;
