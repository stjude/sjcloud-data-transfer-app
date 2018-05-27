import Client from '../../client';
export interface IFindProjectNameOptions {
  regexp?: string;
  flags?: string;
  glob?: string;
}
export interface IFindProjectCreatedOptions {
  after?: string;
  before?: string;
}
export interface IFindProjectDescribeOptions {
  fields: {[name in keyof IProjectDescription]?: boolean};
}
export interface IFindProjectOptions {
  name?: string | IFindProjectNameOptions;
  id?: string[];
  billTo?: string | string[];
  region?: string | string[];
  tags?: string | object;
  properties?: object;
  level?: ProjectLevel;
  explicitPermission?: boolean;
  public?: boolean;
  created?: IFindProjectCreatedOptions;
  describe?: boolean | IFindProjectDescribeOptions;
  starting?: string;
  containsPHI?: boolean;
  limit?: number;
  sharedWith?: string;
}
export declare enum ProjectLevel {
  Administer = 'ADMINISTER',
  Contribute = 'CONTRIBUTE',
  Upload = 'UPLOAD',
  View = 'VIEW',
}
export interface IFileUploadParameters {
  minimumPartSize: number;
  maximumPartSize: number;
  emptyLastPartAllowed: boolean;
  maximumNumParts: number;
  maximumFileSize: number;
}
export interface IProjectDescription {
  id: string;
  class: string;
  name: string;
  region: string;
  summary: string;
  description: string;
  version: number;
  tags: string[];
  billTo: string;
  protected: boolean;
  restricted: boolean;
  downloadRestricted: boolean;
  containsPHI: boolean;
  created: string;
  createdBy: {
    user: string;
    job: string;
    executable: string;
  };
  modified: string;
  level: ProjectLevel;
  dataUsage: number;
  defaultInstanceType: string;
  sponsoredInstanceType: number;
  sponsoredUntil: string;
  pendingTransfer: string | null;
  totalSponsoredEgressBytes: number;
  consumedSponsoredEgressBytes: number;
  atSpendingLimit: boolean;
  storageCost: number;
  folders: string[];
  objects: number;
  permissions: {
    [key: string]: string;
  };
  appCaches: {
    [key: string]: string;
  };
  properties: {
    [key: string]: string;
  };
  fileUploadParameters: IFileUploadParameters;
  availableInstanceTypes: {
    [key: string]: {
      numCores: number;
      totalMemoryMB: number;
      ephemeralStorageGB: number;
      os: {
        [key: string]: {
          distribution: string;
          release: string;
        };
      };
    };
  };
}
export interface IProject {
  id: string;
  level: ProjectLevel;
  permissionSources?: string[];
  public: boolean;
  describe?: Partial<IProjectDescription>;
}
export interface IFindProjectResult {
  results: IProject[];
  next: string | null;
}
declare const findProjects: (
  client: Client,
  options?: IFindProjectOptions
) => Promise<IFindProjectResult>;
export default findProjects;
