/**
 * @module dependency
 * @description Installs the various dependencies required to run the application.
 */

const os = require('os');
const path = require('path');
const fs = require('fs-extra');
import config from './config';
import * as utils from './utils';
import {existsSync} from 'fs';
import {SuccessCallback, ErrorCallback, ProgressCallback} from './types';
import {DownloadInfo} from './config';
import {downloadFile, Timer} from './utils';
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

type Package = 'ANACONDA';
type Platform = 'DARWIN' | 'LINUX' | 'WIN32';
type Architecture = 'IA32' | 'X64';

const parsePlatform = (s: string): Platform => {
  switch (s.toLowerCase()) {
    case 'darwin':
      return 'DARWIN';
    case 'linux':
      return 'LINUX';
    case 'win32':
      return 'WIN32';
    default:
      throw new Error('Invalid platform. Must be Linux, Darwin, or Win32.');
  }
};

const parseArchitecture = (s: string): Architecture => {
  switch (s.toLowerCase()) {
    case 'ia32':
      return 'IA32';
    case 'x64':
      return 'X64';
    default:
      throw new Error('Invalid architecture. Must be IA32 or X64.');
  }
};

/**
 * Get download information from config based on package name.
 *
 * @param package_name Name of the package
 * @returns Relevant URL and SHA256 sum.
 */
export const getDownloadInfo = (name: Package): DownloadInfo | null => {
  try {
    const platformUpper = parsePlatform(platform);
    const archUpper = parseArchitecture(arch);
    return config.DOWNLOAD_INFO[name][platformUpper][archUpper];
  } catch (_e) {
    return null;
  }
};

/**
 * Returns the install command for anaconda given a destination directory.
 *
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
      logging.debug('   [*] Removing existing anaconda installation.');
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
    let timer = new Timer();
    timer.start();
    logging.debug('   [*] Installing anaconda.');
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
          timer.stop();
          logging.debug(`       [-] Took ${timer.duration()} ms.`);
          if (error) return reject(error);
          return resolve(result);
        },
        false
      );
    });
  };

  let buildDefaultPackageSpecs = (): Promise<string[]> => {
    logging.debug('       [-] Looking up default package specs.');

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
    let timer = new Timer();
    timer.start();
    logging.info('   [*] Installing anaconda.');
    logging.debug('       [-] Seeding environment.');
    progressCb(60, 'Installing...');

    return buildDefaultPackageSpecs().then(
      specs =>
        new Promise((resolve, reject) =>
          utils.runCommand(
            `conda create -n sjcloud ${specs.join(' ')} -y`,
            (error, result) => {
              timer.stop();
              logging.debug(`       [-] Took ${timer.duration()} ms.`);
              error ? reject(error) : resolve(result);
            }
          )
        )
    );
  };

  let installDXToolkit = () => {
    logging.debug('   [*] Installing DX-Toolkit.');
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

  let totalTimer = new Timer();
  totalTimer.start();
  progressCb(1, 'Downloading...');
  logging.debug('   [*] Downloading anaconda.');
  logging.debug(`       [-] Download location: ${destination}`);
  let downloadTimer = new Timer();
  downloadTimer.start();
  downloadFile(downloadURL, destination)
    .then(() => {
      downloadTimer.stop();
      logging.debug(`       [-] Took ${downloadTimer.duration()} ms.`);
    })
    .then(initSJCloudHome)
    .then(installAnaconda)
    .then(seedAnaconda)
    .then(installDXToolkit)
    .then(() => {
      totalTimer.stop();
      logging.debug(`   [*] Full install took ${totalTimer.duration()} ms. `);
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
