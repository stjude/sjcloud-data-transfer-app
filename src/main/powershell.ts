/**
 * PowerShell utilities.
 *
 * @module powershell
 */

import { ChildProcess, exec } from 'child_process';

import { CommandCallback } from './types';

const EXE = 'powershell.exe';
const DEFAULT_ARGS = [
  '-ExecutionPolicy',
  'Bypass',
  '-NoProfile',
  '-NonInteractive',
  '-Command',
];

const escapeCommand = (s: string): string => s.replace(/"/g, '\\"');

/**
 * Executes a command in PowerShell.
 *
 * @param {string} command The command to execute.
 * @param {CommandCallback} cb The callback called with the output after the
 *                             command completes.
 * @returns {ChildProcess} An event emitter of the child process.
 * @
 */
export const powershell = (
  command: string,
  cb: CommandCallback,
): ChildProcess => {
  const cmd = `${EXE} ${DEFAULT_ARGS.join(' ')} ${escapeCommand(command)}`;
  return exec(cmd, cb);
};
