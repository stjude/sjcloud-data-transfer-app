import Client from '../../client';
import {IFileDescription} from '../project/listFolder';
export interface IDescribeOptions {
  project?: string;
  defaultFields?: boolean;
  fields?: {[name in keyof IFileDescription]?: boolean};
  parts?: boolean;
  properties?: boolean;
  details?: boolean;
}
export interface IDescribeResult extends IFileDescription {
  id: string;
}
declare const describe: (
  client: Client,
  fileId: string,
  options?: IDescribeOptions
) => Promise<IDescribeResult>;
export default describe;
