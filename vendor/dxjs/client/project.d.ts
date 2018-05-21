import Client from '.';
import {IDescribeOptions, IDescribeResult} from '../methods/project/describe';
import {
  IListFolderOptions,
  IListFolderResult,
} from '../methods/project/listFolder';
import {
  INewFolderOptions,
  INewFolderResult,
} from '../methods/project/newFolder';
declare class ProjectClient {
  private client;
  constructor(client: Client);
  describe(
    projectId: string,
    options?: IDescribeOptions
  ): Promise<IDescribeResult>;
  listFolder(
    projectId: string,
    options?: IListFolderOptions
  ): Promise<IListFolderResult>;
  newFolder(
    projectId: string,
    options: INewFolderOptions
  ): Promise<INewFolderResult>;
}
export default ProjectClient;
