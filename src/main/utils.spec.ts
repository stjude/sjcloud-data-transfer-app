import * as utils from './utils';
import { existsSync } from 'fs';
import * as path from 'path';
import * as tmp from 'tmp';
import * as os from 'os';

describe('SJ Cloud Home', () => {
  it('should succeed when initializing to a valid directory', () => {
    utils.initSJCloudHome((error, result) => {
      expect(error).toBeNull();
      expect(existsSync(utils.sjcloudHomeDirectory)).toBe(true);
    });
  });

  it('should succeed when saving to a file to its directory', () => {
    utils.saveToSJCloudFile('test-file', 'test-content', (error: Error) => {
      expect(error).toBeNull();
      expect(
        existsSync(path.join(utils.sjcloudHomeDirectory, 'test-file')),
      ).toBe(true);
    });
  });
});

describe('Readable File Sizes', () => {
  it('should return 0 GB for a 0 byte or NaN value', () => {
    expect(utils.readableFileSize(0)).toBe('0 GB');
    expect(utils.readableFileSize(NaN)).toBe('0 GB');
  });

  it('should return 10B for 10 byte file', () => {
    expect(utils.readableFileSize(10)).toBe('10 B');
  });

  it('should return 1.0 MB for 1 MB file', () => {
    expect(utils.readableFileSize(1000000)).toBe('1.0 MB');
  });

  it('should return 10.0 GB for 10 MB file', () => {
    expect(utils.readableFileSize(10000000000)).toBe('10.0 GB');
  });
});

describe('File Info from path', () => {
  it('should return a valid FileInfo object on valid input', () => {
    let tmpObj = tmp.fileSync({
      prefix: 'testFile',
      postfix: '.txt',
    });
    let result = utils.fileInfoFromPath(tmpObj.name);
    expect(result.name).toBe(path.basename(tmpObj.name));
    expect(result.raw_size).toBe(0);
  });

  it('should error on an invalid path', () => {
    let invalidPath = path.join(os.homedir(), 'invalid-path');
    try {
      let result = utils.fileInfoFromPath(invalidPath);
    } catch (err) {
      expect(err.message.includes('ENOENT')).toBe(true);
    }
  });
});

describe('Resetting file status', () => {
  it('should work if valid file is passed', () => {
    let file = {
      name: 'testName',
      raw_size: 10,
      size: '10 B',
      status: 1,
      checked: true,
      waiting: true,
      started: true,
      finished: true,
    };
    utils.resetFileStatus(file);
    expect(file.status).toBe(0);
    expect(file.waiting).toBe(false);
    expect(file.started).toBe(false);
    expect(file.finished).toBe(false);
  });
});

describe('Self sign', () => {
  it('should generate valid certs', () => {
    utils.selfSigned((error: any, result: any) => {
      expect(error).toBeNull();
      expect(result).not.toBeNull();
    });
  });
});

describe('Timer class', () => {
  let timer: utils.Timer;
  beforeEach(() => {
    timer = new utils.Timer();
  });

  it('should return a positive number', () => {
    timer.start();
    timer.stop();
    expect(timer.duration()).toBeGreaterThanOrEqual(0);
  });

  it('should return -1 if timer is not stopped', () => {
    timer.start();
    expect(timer.duration()).toBe(-1);
  });
});
