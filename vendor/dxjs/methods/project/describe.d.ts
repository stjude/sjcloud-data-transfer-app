import Client from '../../client';
import {IProjectDescription} from '../system/findProjects';
export interface IDescribeOptions {
  fields?: {[name in keyof IProjectDescription]?: boolean};
}
export interface IDescribeResult extends Partial<IProjectDescription> {
  id: string;
}
declare const describe: (
  client: Client,
  projectId: string,
  options?: IDescribeOptions
) => Promise<IDescribeResult>;
export default describe;
