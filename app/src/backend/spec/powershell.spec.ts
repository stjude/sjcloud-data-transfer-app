import { ChildProcess } from 'child_process';
import * as os from 'os';

import { CommandCallback } from '../types';

const powershell: PowershellFn = require('../../../app/bin/backend/powershell')
  .default;

type PowershellFn = (command: string, cb: CommandCallback) => ChildProcess;

if (os.platform() === 'win32') {
  describe('powershell', () => {
    let originalTimeoutInterval: number;

    beforeAll(() => {
      originalTimeoutInterval = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeoutInterval * 4;
    });

    afterAll(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeoutInterval;
    });

    it('captures stdout', done => {
      powershell('Write-Output "foo"', (_err, stdout) => {
        expect(stdout).toBe('foo\r\n');
        done();
      });
    });

    it('captures stderr', done => {
      const command = '[System.Console]::Error.WriteLine("bar")';
      powershell(command, (_err, _stdout, stderr) => {
        expect(stderr).toBe('bar\r\n');
        done();
      });
    });
  });
}
