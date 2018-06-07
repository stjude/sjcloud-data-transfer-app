import Client from '../../client';
export interface IRemoveObjectsOptions {
  objects: string[];
  force?: boolean;
}
export interface IRemoveObjectsResult {
  id: string;
}
declare const removeObjects: (
  client: Client,
  projectId: string,
  options: IRemoveObjectsOptions,
) => Promise<IRemoveObjectsResult>;
export default removeObjects;
