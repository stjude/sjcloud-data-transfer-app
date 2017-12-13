const _ = require("lodash");
const os = require("os");
const fs = require("fs-extra");
const path = require("path");
const utils = require("../../app/bin/backend/utils");


/*******************************************************************************
 * utils.getSJCloudPaths
 ******************************************************************************/

describe("Determining SJCloud paths", () => {
  describe("in UNIX", () => {
    it("should return the following by default", () => {
      const result = utils.getSJCloudPaths(null, "linux");
      const expectedResult = {
        SJCLOUD_HOME: '/Users/cmcleod/.sjcloud',
        ANACONDA_HOME: '/Users/cmcleod/.sjcloud/anaconda',
        ANACONDA_BIN: '/Users/cmcleod/.sjcloud/anaconda/bin',
        ANACONDA_SJCLOUD_ENV: '/Users/cmcleod/.sjcloud/anaconda/envs/sjcloud',
        ANACONDA_SJCLOUD_BIN: '/Users/cmcleod/.sjcloud/anaconda/envs/sjcloud/bin'
      };

      expect(result).toEqual(expectedResult);
    });

    it("should return the following with sjcloudHomeDirectory = '/test/'", () => {
      const result = utils.getSJCloudPaths('/test/', "linux");
      const expectedResult =
        {
          SJCLOUD_HOME: '/test/',
          ANACONDA_HOME: '/test/anaconda',
          ANACONDA_BIN: '/test/anaconda/bin',
          ANACONDA_SJCLOUD_ENV: '/test/anaconda/envs/sjcloud',
          ANACONDA_SJCLOUD_BIN: '/test/anaconda/envs/sjcloud/bin'
        }

      expect(result).toEqual(expectedResult);
    });
  });

  describe("in Windows", () => {
    it("should return the following by default", () => {
      const result = utils.getSJCloudPaths(null, "win32");
      const expectedResult = {
        SJCLOUD_HOME: '/Users/cmcleod/.sjcloud',
        ANACONDA_HOME: '/Users/cmcleod/.sjcloud/anaconda',
        ANACONDA_BIN: '/Users/cmcleod/.sjcloud/anaconda/Scripts',
        ANACONDA_SJCLOUD_ENV: '/Users/cmcleod/.sjcloud/anaconda/envs/sjcloud',
        ANACONDA_SJCLOUD_BIN: '/Users/cmcleod/.sjcloud/anaconda/envs/sjcloud/bin'
      };

      expect(result).toEqual(expectedResult);
    });

    it("should return the following with sjcloudHomeDirectory = '/test/'", () => {
      const result = utils.getSJCloudPaths('/test/', "win32");
      const expectedResult =
        {
          SJCLOUD_HOME: '/test/',
          ANACONDA_HOME: '/test/anaconda',
          ANACONDA_BIN: '/test/anaconda/Scripts',
          ANACONDA_SJCLOUD_ENV: '/test/anaconda/envs/sjcloud',
          ANACONDA_SJCLOUD_BIN: '/test/anaconda/envs/sjcloud/bin'
        }

      expect(result).toEqual(expectedResult);
    });

  });
});

/*******************************************************************************
 * utils.initSJCloudHome
 ******************************************************************************/

describe("Initializing SJCloud home directory", () => {
  const fakeSJCloudHome = path.join(os.homedir(), ".sjcloud-testing-init");

  it("should return the following result when directory doesn't exist", (done) => {
    fs.remove(fakeSJCloudHome, (error: any) => {
      utils.initSJCloudHome((error: any, result: any) => {
        expect(error).toBeNull();
        expect(result).toBe(true);
        expect(fs.existsSync(fakeSJCloudHome)).toBe(true);
        done();
      }, fakeSJCloudHome);
    });
  });

  it("should return the following result when directory does exist", (done) => {
    utils.initSJCloudHome((error: any, result: any) => {
      expect(error).toBeNull();
      expect(result).toBe(false);
      expect(fs.existsSync(fakeSJCloudHome)).toBe(true);
      done();
    }, fakeSJCloudHome);
  });

  afterAll((done) => { fs.remove(fakeSJCloudHome, () => { done(); }); })
});