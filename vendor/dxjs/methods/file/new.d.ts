import Client from '../../client';
export interface INewOptions {
  project: string;
  name?: string;
  tags?: string[];
  types?: string[];
  hidden?: boolean;
  properties?: {
    [key: string]: string;
  };
  details?: object;
  folder?: string;
  parents?: boolean;
  media?: string;
  nonce?: string;
}
export interface INewResult {
  id: string;
}
declare const dxNew: (
  client: Client,
  options: INewOptions,
) => Promise<INewResult>;
export default dxNew;
