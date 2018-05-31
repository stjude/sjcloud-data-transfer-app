/**
 * @module dx
 * @description Methods for interacting with DNAnexus.
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execSync } from 'child_process';

import { Request } from 'request';

import * as utils from './utils';
import * as logging from './logging';
import config from './config';
import { IRemoteLocalFilePair } from './queue';
import { Client } from '../../vendor/dxjs';
import { IDescribeOptions } from '../../vendor/dxjs/methods/file/describe';
import { DataObjectState } from '../../vendor/dxjs/methods/system/findDataObjects';
import {
  ProjectLevel,
  IFileUploadParameters,
} from '../../vendor/dxjs/methods/system/findProjects';
import {
  SuccessCallback,
  ResultCallback,
  SJDTAFile,
  SJDTAProject,
} from './types';

const request = require('request');
const progress = require('request-progress');
const async = require('async');
const expandHomeDir = require('expand-home-dir');
const platform = os.platform();

/**
 * Logout of DNAnexus via the dx command line utility.
 *
 * @param callback
 */
export function logout(callback: SuccessCallback, dryrun: boolean = false) {
  // @FIXME
  callback(null, true);
}
