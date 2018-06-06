import Client from '../../client';
export interface INewFolderOptions {
  folder: string;
  parents?: boolean;
}
export interface INewFolderResult {
  id: string;
}
declare const newFolder: (
  client: Client,
  projectId: string,
  options: INewFolderOptions,
) => Promise<INewFolderResult>;
export default newFolder;
