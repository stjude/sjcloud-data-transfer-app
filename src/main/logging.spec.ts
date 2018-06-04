import * as os from 'os';
import * as path from 'path';

import * as moment from 'moment';
import { ConsoleTransportInstance, FileTransportInstance } from 'winston';

import { envLevel, logging } from './logging';

describe('envLevel', () => {
  describe('with an override', () => {
    it('sets the log level to the override', () => {
      expect(envLevel('verbose')).toBe('verbose');
    });
  });

  describe('with no override', () => {
    describe('NODE_ENV=production', () => {
      let previousNodeEnv: string | undefined;

      beforeAll(() => {
        previousNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
      });

      afterAll(() => {
        process.env.NODE_ENV = previousNodeEnv;
      });

      it("sets the log level to 'info'", () => {
        expect(envLevel()).toBe('info');
      });
    });

    describe('NODE_ENV=any', () => {
      let previousNodeEnv: string | undefined;

      beforeAll(() => {
        previousNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
      });

      afterAll(() => {
        process.env.NODE_ENV = previousNodeEnv;
      });

      it("sets the log level to 'debug'", () => {
        expect(envLevel()).toBe('debug');
      });
    });
  });
});

describe('logging', () => {
  it('gets its log level from the environment', () => {
    // Assuming NODE_ENV=test.
    expect(logging.level).toBe('debug');
  });

  it('has two transports for writing to the console and a file', () => {
    const names = Object.keys(logging.transports);
    expect(names).toEqual(['console', 'file']);
  });

  describe("logging.transports['console']", () => {
    it("formats the timestamp with 'YYYY-MM-DD HH:mm:ss.SSSS'", () => {
      const transport = logging.transports[
        'console'
      ] as ConsoleTransportInstance;
      const timestamp = transport.timestamp as () => string;
      const now = moment(timestamp(), 'YYYY-MM-DD HH:mm:ss.SSSS');
      expect(now.isValid()).toBe(true);
    });
  });

  describe("logging.transports['file']", () => {
    let transport: FileTransportInstance;

    beforeEach(() => {
      transport = logging.transports['file'] as FileTransportInstance;
    });

    it('writes the file to $SJCLOUD_HOME/log.txt', () => {
      // FileTransportInstance.{dirname,filename} are possibly not public.
      const t = transport as any;
      expect(t.dirname).toBe(path.join(os.homedir(), '.sjcloud'));
      expect(t.filename).toBe('log.txt');
    });

    it('has a max filesize of 5 MiB', () => {
      expect(transport.maxsize).toBe(5 * 1024 * 1024);
    });

    it('logs in plain text', () => {
      expect(transport.json).toBe(false);
    });
  });
});
