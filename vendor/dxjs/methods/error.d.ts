import {Response} from 'node-fetch';
export interface IErrorDetails {
  field: string;
  reason: string;
  expected: string;
}
export interface IErrorResult {
  error: {
    type: string;
    message: string;
    details?: IErrorDetails;
  };
}
/**
 * An `Error` class representing an unsuccessful DNAnexus API call.
 *
 * This is most commonly thrown when a non-200 response is returned after
 * requesting a resource from DNAnexus.
 *
 * See <https://wiki.dnanexus.com/API-Specification-v1.0.0/Protocols#Errors>.
 */
declare class DxError extends Error {
  static okOrThrow(response: Response): Promise<void>;
  type: string;
  constructor(type: string, message: string);
}
export default DxError;
