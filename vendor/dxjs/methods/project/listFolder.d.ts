import {Timestamp} from '../..';
import Client from '../../client';
export declare enum ListType {
  Folders = 'folders',
  Objects = 'objects',
  All = 'all',
}
export interface IListFolderDescribeOptions {
  fields: {[name in keyof IFileDescription]?: boolean};
}
export interface IListFolderOptions {
  folder?: string;
  describe?: boolean | IListFolderDescribeOptions;
  only?: ListType;
  includeHidden?: boolean;
}
export declare enum FileState {
  Open = 'open',
  Closing = 'closing',
  Closed = 'closed',
}
export declare enum FilePartState {
  Pending = 'pending',
  Complete = 'complete',
}
export interface IFileParts {
  [key: string]: {
    state: FilePartState;
    size: number | null;
    md5: string | null;
  };
}
export interface IFileDescription {
  id: string;
  project: string;
  class: string;
  types: string[];
  created: Timestamp;
  state: FileState;
  hidden: boolean;
  links: string[];
  name: string;
  folder: string;
  sponsored: boolean;
  tags: string[];
  modified: Timestamp;
  media: string;
  createdBy: {
    user: string;
    job: string;
    executable: string;
  };
  parts: IFileParts;
  size: number;
  sponsoredUntil: Timestamp;
  properties: object;
  details: any;
}
export interface IFile {
  id: string;
  describe?: Partial<IFileDescription>;
}
export interface IListFolderResult {
  objects: IFile[];
  folders: string[];
}
declare const listFolder: (
  client: Client,
  projectId: string,
  options?: IListFolderOptions
) => Promise<IListFolderResult>;
export default listFolder;
