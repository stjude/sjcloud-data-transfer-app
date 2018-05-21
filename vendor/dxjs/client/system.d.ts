import Client from '.';
import {
  IFindDataObjectsOptions,
  IFindDataObjectsResult,
} from '../methods/system/findDataObjects';
import {
  IFindProjectOptions,
  IFindProjectResult,
} from '../methods/system/findProjects';
import {IWhoAmIResult} from '../methods/system/whoami';
declare class SystemClient {
  private client;
  constructor(client: Client);
  findDataObjects(
    options?: IFindDataObjectsOptions
  ): Promise<IFindDataObjectsResult>;
  /**
   * @param options inputs to the /system/findProjects method
   * @returns a list of projects accessible to the user
   */
  findProjects(options?: IFindProjectOptions): Promise<IFindProjectResult>;
  whoami(): Promise<IWhoAmIResult>;
}
export default SystemClient;
