import FileClient from './file';
import ProjectClient from './project';
import SystemClient from './system';
declare class Client {
  file: FileClient;
  project: ProjectClient;
  system: SystemClient;
  private headers;
  /**
   * @param token a DNAnexus access token
   */
  constructor(token: string);
  /**
   * Sends a HTTP POST request.
   *
   * @param path the path to make a request on api.dnanexus.com
   * @param body the request payload
   * @returns @FIXME
   */
  post(path: string, body?: object): Promise<Response>;
  private buildEndpoint(path);
  private buildOptions(body);
}
export default Client;
