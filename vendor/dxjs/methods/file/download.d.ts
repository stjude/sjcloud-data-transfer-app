import Client from '../../client';
export interface IDownloadOptions {
  duration?: number;
  filename?: string;
  project?: string;
  preauthenticated?: boolean;
  stickyIP?: boolean;
}
export interface IDownloadResult {
  url: string;
  headers: {
    [key: string]: string;
  };
}
declare const download: (
  client: Client,
  fileId: string,
  options?: IDownloadOptions
) => Promise<IDownloadResult>;
export default download;
