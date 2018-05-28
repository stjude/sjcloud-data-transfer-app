import {Timestamp} from '../..';
import Client from '../../client';
import {IFileDescription} from '../project/listFolder';
export declare enum DataObjectState {
  Open = 'open',
  Closing = 'closing',
  Closed = 'closed',
  Any = 'any',
}
export declare enum DataObjectVisibility {
  Hidden = 'hidden',
  Visible = 'visible',
  Either = 'either',
}
export declare enum DataObjectLevel {
  View = 'VIEW',
  Upload = 'UPLOAD',
  Contribute = 'CONTRIBUTE',
  Administer = 'ADMINISTER',
}
export interface IFindDataObjectsNameOptions {
  regexp?: string;
  flags?: string;
  glob?: string;
}
export interface IFindDataObjectsScopeOptions {
  project: string;
  folder?: string;
  recurse?: boolean;
}
export interface IFindDataObjectsDescribeOptions {
  fields: {[name in keyof IFileDescription]?: boolean};
}
export interface IFindDataObjectsOptions {
  class?: string;
  state?: DataObjectState;
  visibility?: DataObjectVisibility;
  name?: string | IFindDataObjectsNameOptions;
  id?: string[];
  type?: string | object;
  tags?: string | object;
  region?: string | string[];
  properties?: object;
  link?: string;
  scope?: IFindDataObjectsScopeOptions;
  level?: DataObjectLevel;
  modified?: {
    after?: Timestamp;
    before?: Timestamp;
  };
  created?: {
    after?: Timestamp;
    before?: Timestamp;
  };
  describe?: boolean | IFindDataObjectsDescribeOptions;
  starting?: object;
  limit?: number;
}
export interface IDataObject {
  project: string;
  id: string;
  describe?: Partial<IFileDescription>;
}
export interface IFindDataObjectsResult {
  results: IDataObject[];
  next: object | null;
}
declare const findDataObjects: (
  client: Client,
  options?: IFindDataObjectsOptions
) => Promise<IFindDataObjectsResult>;
export default findDataObjects;
