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
          'sjcloud'
        ),
        ANACONDA_SJCLOUD_BIN: path.join(
          tildeDir,
          'anaconda',
          'envs',
          'sjcloud',
          'bin'
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
    command = 'Write-Debug "Bleep Blop Bloop" -Debug';
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

/**
 * utils.parsePythonVersion
 */

describe('Parsing the Python version', () => {
  it("should return [2.7.14] for input 'Python 2.7.14'", () => {
    const versionString = 'Python 2.7.14';
    let [major, minor, patch] = utils.parsePythonVersion(versionString);
    expect(major).toBe(2);
    expect(minor).toBe(7);
    expect(patch).toBe(14);
  });

  it("should fail for input 'Bleep Blop Bloop'", () => {
    const versionString = 'Bleep Blop Bloop';
    expect(() => {
      utils.parsePythonVersion(versionString);
    }).toThrowError(
      `Could not parse Python version from string '${versionString}'`
    );
  });
});

/**
 * utils.computeSHA256
 */

describe('Computing the SHA256 sum', () => {
  const tempdir = fs.mkdtempSync('.tmp/test-');
  const file = path.join(tempdir, 'file.txt');
  const badfile = path.join(tempdir, 'badfile.txt');
  const contents = 'Bleep Blop Bloop';

  beforeAll(done => {
    fs.writeFile(file, contents, () => {
      // badfile should never exist, but we will ensure it doesn't.
      fs.remove(badfile, () => {
        done();
      });
    });
  });

  it(`should return the following output for a file containing '${
    contents
  }'`, done => {
    utils.computeSHA256(file, (error: any, result: any) => {
      expect(error).toBeNull();
      expect(result).toBe(
        '532230c0c423fdf35f095e95a47bb8d2cdcf8633273a138e012be48b700ab03e'
      );
      done();
    });
  });

  it("should produce an error if the file doesn't exit", done => {
    expect(() => {
      utils.computeSHA256(badfile, null);
    }).toThrowError(`${badfile} does not exist!`);
    done();
  });

  it('should produce an error if the input is a directory', done => {
    expect(() => {
      utils.computeSHA256(tempdir, null);
    }).toThrowError(`${tempdir} is not a file!`);
    done();
  });

  afterAll(done => {
    fs.remove(tempdir, done);
  });
});
