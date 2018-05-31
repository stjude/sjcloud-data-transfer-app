/**
 * @module utils
 * @description Contains the various utility functions used in the application.
 **/

import * as fs from 'fs';
import * as crypto from 'crypto';

export interface IByteRange {
  start: number;
  end: number;
}

export const byteRanges = (
  totalSize: number,
  chunkSize: number,
): IByteRange[] => {
  const n = Math.ceil(totalSize / chunkSize);
  const pieces = [];

  let i = 0;

  while (i < n - 1) {
    const start = chunkSize * i;
    const end = start + chunkSize - 1;
    pieces.push({ end, start });
    i++;
  }

  const lastStart = chunkSize * i;
  pieces.push({ end: totalSize - 1, start: lastStart });

  return pieces;
};

export const md5Sum = (
  pathname: string,
  start: number = 0,
  end: number = Infinity,
): Promise<string> => {
  return new Promise(resolve => {
    const hash = crypto.createHash('md5');
    const reader = fs.createReadStream(pathname, { start, end });

    reader.on('data', (chunk: Buffer | string | any) => {
      hash.update(chunk);
    });

    reader.on('end', () => {
      resolve(hash.digest('hex'));
    });
  });
};
