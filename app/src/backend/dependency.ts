const os = require('os');
const path = require('path');
const fs = require('fs-extra');
import config from './config';
import * as utils from './utils';
import {existsSync} from 'fs';
import {
  DXDownloadInfo,
  SuccessCallback,
  ErrorCallback,
  ProgressCallback,
} from './types';
import {downloadFile} from './utils';
import * as logging from './logging-remote';

// Package names are from `data.actions.{FETCH, LINK}` in the final object after
// running `conda create --json --name sjcloud python=2.7.14`.
const CONDA_ENV_DEFAULT_PACKAGE_NAMES = new Set([
  'ca-certificates',
  'certifi',
  'libcxx',
  'libcxxabi',
  'libedit',
  'libffi',
  'ncurses',
  'openssl',
  'pip',
  'python',
  'readline',
  'setuptools',
  'sqlite',
  'tk',
  'wheel',
  'zlib',
]);

interface CondaPackage {
  base_url: string | null;
  build_number: number;
  build_string: string;
  channel: string;
  dist_name: string;
  name: string;
  platform: string | null;
  version: string;
}

let arch = os.arch();
let platform = os.platform();
if (!platform)
  throw new Error(`Unrecognized platform. Must be Windows, Mac, or Ubuntu.`);

/**
 * Get download information from config based on package name.
 *
 * @param packagename Name of the package
 * @returns Relevant URL and SHA256 sum.
 */
export function getDownloadInfo(packagename: string): DXDownloadInfo {
  let platformUpper = platform.toUpperCase();
  let archUpper = arch.toUpperCase();
  packagename = packagename.toUpperCase();

  // Combining these made the code unreadable.
  if (!('DOWNLOAD_INFO' in config)) {
    return null;
  }
  if (!(packagename in config['DOWNLOAD_INFO'])) {
    return null;
  }
  if (!(platformUpper in config['DOWNLOAD_INFO'][packagename])) {
    return null;
  }

  let dlInfo = config['DOWNLOAD_INFO'][packagename][platformUpper];
  if ('IA32' in dlInfo || 'X64' in dlInfo) {
    if (!(archUpper in dlInfo)) return null;
    dlInfo = dlInfo[archUpper];
  }

  return dlInfo;
}

/**
 * Returns the install command for anaconda given a destination directory.
 * @param destination Directory to install anaconda to.
 * @returns Anaconda install command to be run.
 */
function getAnacondaInstallCommand(destination: string): string {
  let command = '';
  platform = platform.toUpperCase();

  if (platform === 'WIN32') {
    command = `Start-Process ${
      destination
    } -ArgumentList '/S','/AddToPath=0','RegisterPython=0','/D=${utils.lookupPath(
      'ANACONDA_HOME'
    )}' -Wait`;
  } else {
    command = `bash ${destination} -b -p ${utils.lookupPath('ANACONDA_HOME')}`;
  }
  return command;
}

/**
 * Install Anaconda to the correct location.
 *
 * @param progressCb Callback to update the progress of the UI.
 * @param finishedCb Called when either an error occurs or anaconda is
 *                   successfully installed.
 * @param removeAnacondaIfExists If the anaconda folder exists and this method
 *                               is being called, it's likely that the last
 *                               install crashed midway. Should we remove any
 *                               old install attempts?
 */
export function installAnaconda(
  progressCb: ProgressCallback,
  finishedCb: SuccessCallback,
  removeAnacondaIfExists: boolean = true
) {
  if (existsSync(utils.lookupPath('ANACONDA_HOME'))) {
    logging.debug('');
    logging.debug('== Installing Dependencies ==');

    if (removeAnacondaIfExists) {
      logging.debug('  [*] Removing existing anaconda installation.');
      fs.remove(utils.lookupPath('ANACONDA_HOME')).catch((error: any) => {
        throw error;
      });
    } else {
      throw new Error(
        'Anaconda is already installed! This method should not be called.'
      );
    }
  }

  const downloadInfo = getDownloadInfo('ANACONDA');
  if (!downloadInfo)
    throw new Error(
      `Could not get download info for Anaconda based on your platform!\nPlatform: ${
        platform
      }, Arch: ${arch}.`
    );

  const downloadURL: string = downloadInfo.URL;
  const expectedDownloadHash: string = downloadInfo.SHA256SUM;

  const tmpdir = os.tmpdir();
  const basename = path.basename(downloadURL);
  let destination = path.join(tmpdir, basename);

  let initSJCloudHome = () => {
    progressCb(25, 'Installing...');
    return new Promise((resolve, reject) => {
      utils.initSJCloudHome((error, result) => {
        if (error) return reject(error);
        return resolve(result);
      });
    });
  };

  let installAnaconda = () => {
    logging.debug('  [*] Installing anaconda.');
    progressCb(30, 'Installing...');
    return new Promise((resolve, reject) => {
      const command = getAnacondaInstallCommand(destination);
      logging.silly(
        `      [-] Download location: ${utils.lookupPath('ANACONDA_HOME')}`
      );
      logging.silly(`      [-] Command: ${command}`);

      utils.runCommand(
        command,
        (error, result) => {
          if (error) return reject(error);
          return resolve(result);
        },
        false
      );
    });
  };

  let buildDefaultPackageSpecs = (): Promise<string[]> => {
    logging.debug('    [*] Looking up default package specs.');

    return new Promise((resolve, reject) => {
      const cmd = 'conda list --json';

      utils.runCommand(cmd, (error, result) => {
        if (error) {
          reject(error);
        }

        const list: CondaPackage[] = JSON.parse(result);
        const specs = list
          .filter(pkg => CONDA_ENV_DEFAULT_PACKAGE_NAMES.has(pkg.name))
          .map(pkg => `${pkg.name}=${pkg.version}=${pkg.build_string}`);

        resolve(specs);
      });
    });
  };

  let seedAnaconda = () => {
    logging.debug('  [*] Seeding anaconda environment.');
    progressCb(60, 'Installing...');

    return buildDefaultPackageSpecs().then(
      specs =>
        new Promise((resolve, reject) =>
          utils.runCommand(
            `conda create -n sjcloud ${specs.join(' ')} -y`,
            (error, result) => (error ? reject(error) : resolve(result))
          )
        )
    );
  };

  let installDXToolkit = () => {
    logging.debug('  [*] Installing DX-Toolkit.');
    progressCb(95, 'Installing...');
    return new Promise((resolve, reject) => {
      utils.runCommand(
        'pip install dxpy',
        (error, result) => {
          if (error) return reject(error);
          return resolve(result);
        },
        false
      ); // sometimes dxtoolkit returns a pip update warning to stderr
      // which causes the command to fail
    });
  };

  progressCb(1, 'Downloading...');
  logging.debug('  [*] Downloading anaconda.');
  logging.silly(`      [-] Download location: ${destination}`);
  downloadFile(downloadURL, destination)
    .then(initSJCloudHome)
    .then(installAnaconda)
    .then(seedAnaconda)
    .then(installDXToolkit)
    .then(() => {
      return new Promise((resolve, reject) => {
        progressCb(100, 'Finished!');
        finishedCb(null, true);
        resolve(true);
      });
    })
    .catch((error: any) => {
      finishedCb(error, 'Could not install!');
    });
}
