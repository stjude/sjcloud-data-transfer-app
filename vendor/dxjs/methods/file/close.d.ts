import Client from '../../client';
export interface ICloseResult {
  id: string;
}
declare const close: (client: Client, fileId: string) => Promise<ICloseResult>;
export default close;
