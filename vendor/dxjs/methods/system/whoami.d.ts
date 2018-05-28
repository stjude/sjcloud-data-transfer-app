import Client from '../../client';
export interface IWhoAmIResult {
  id: string;
}
declare const whoami: (client: Client) => Promise<IWhoAmIResult>;
export default whoami;
