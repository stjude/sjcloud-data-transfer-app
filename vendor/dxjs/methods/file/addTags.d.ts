import Client from '../../client';
export interface IAddTagsOptions {
  project: string;
  tags: string[];
}
export interface IAddTagsResult {
  id: string;
}
declare const addTags: (
  client: Client,
  fileId: string,
  options: IAddTagsOptions,
) => Promise<IAddTagsResult>;
export default addTags;
