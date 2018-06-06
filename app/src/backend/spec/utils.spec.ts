const os = require('os');
const path = require('path');
const fs = require('fs-extra');
const utils = require('../../../app/bin/backend/utils');

const platform = os.platform();

/**
 * utils.getSJCloudPaths
 */

describe('Determining SJCloud paths', () => {
  describe('in UNIX', () => {
    const tildeDir = path.join(os.homedir(), '.sjcloud');

    it('should return the following by default', () => {
      const result = utils.getSJCloudPaths(null, 'linux');
      const expectedResult = {
        SJCLOUD_HOME: tildeDir,
        ANACONDA_HOME: path.join(tildeDir, 'anaconda'),
        ANACONDA_BIN: path.join(tildeDir, 'anaconda', 'bin'),
        ANACONDA_SJCLOUD_ENV: path.join(
          tildeDir,
          'anaconda',
          'envs',
          'sjcloud',
        ),
        ANACONDA_SJCLOUD_BIN: path.join(
          tildeDir,
          'anaconda',
          'envs',
          'sjcloud',
          'bin',
        ),
      };
      expect(result).toEqual(expectedResult);
    });
  });
});

/**
 * utils.initSJCloudHome
 */

describe('Initializing SJCloud home directory', () => {
  const fakeSJCloudHome = path.join(os.homedir(), '.sjcloud-testing-init');

  it("should return the following result when directory doesn't exist", done => {
    fs.remove(fakeSJCloudHome, (error: any) => {
      utils.initSJCloudHome((error: any, result: any) => {
        expect(error).toBeNull();
        expect(result).toBe(true);
        expect(fs.existsSync(fakeSJCloudHome)).toBe(true);
        done();
      }, fakeSJCloudHome);
    });
  });

  it('should return the following result when directory does exist', done => {
    utils.initSJCloudHome((error: any, result: any) => {
      expect(error).toBeNull();
      expect(result).toBe(false);
      expect(fs.existsSync(fakeSJCloudHome)).toBe(true);
      done();
    }, fakeSJCloudHome);
  });

  afterAll(done => {
    fs.remove(fakeSJCloudHome, () => {
      done();
    });
  });
});

/**
 * utils.runCommand
 */

describe('Running', () => {
  let command: string;

  if (platform === 'win32') {
    command = 'Write-Output "Bleep Blop Bloop"';
  } else {
    command = "echo 'Bleep Blop Bloop'";
  }

  it('an echo command should work without erroring', done => {
    utils.runCommand(command, (error: any, result: any) => {
      expect(error).toBeNull();
      done();
    });
  });
});
