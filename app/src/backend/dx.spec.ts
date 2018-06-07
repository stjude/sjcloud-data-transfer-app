/**
 * The following environment variables are required to run these tests.
 *
 *   - DXTOKEN:   a valid DX token to login with.
 *   - DXFILE:    a representative file which we have access to.
 *   - DXPROJECT: a project Id that contains at least one file (preferably the
 *       one pointed to by DXFILE).
 **/

import * as path from 'path';
import { statSync } from 'fs';

import * as tmp from 'tmp';
import { error } from 'util';
import * as rimraf from 'rimraf';
// const rimraf = require('rimraf');

import * as dx from './dx';
import { SJDTAFile } from './types';

if (process.env.DXTOKEN) {
  const token = process.env.DXTOKEN;

  describe('The DNAnexus API wrapper', () => {
    it('should return true we are loggedIn with a correct API token.', done => {
      dx.loggedIn(token, (error, result) => {
        expect(error).toBeNull();
        expect(result).toBe(true);
        done();
      });
    });

    it('should return false when we are loggedIn with an incorrect API token.', done => {
      dx.loggedIn('', (error, result) => {
        expect(error).not.toBeNull();
        expect(result).toBe(false);
        done();
      });
    });

    it('should login correctly with an API token.', done => {
      dx.login(token, (error, result) => {
        expect(error).toBeNull();
        expect(result).toBe(true);
        done();
      });
    });

    it('should give false when using an incorrect API token.', done => {
      dx.login('NotARealToken', (error, result) => {
        expect(error).not.toBeNull();
        expect(result).toBe(false);
        if (error) {
          expect(error.message).toEqual('The token could not be found');
        }
        done();
      });
    });

    it('should error when the API token is empty.', done => {
      dx.login('', (error, result) => {
        expect(error).not.toBeNull();
        expect(result).toBeNull();
        done();
      });
    });

    if (process.env.DXFILE) {
      const file = process.env.DXFILE;

      it('should successfully describe a dx-file.', done => {
        dx.describeDXItem(token, file, (error, result) => {
          expect(error).toBeNull();
          expect(result).not.toBeNull();
          if (result) {
            const keys = Object.keys(result);
            expect(keys).toContain('id');
            expect(keys).toContain('properties');
            expect(keys).toContain('size');
            expect(keys).toContain('tags');
          }
          done();
        });
      });

      it('should fail on an invalid dx-file id.', done => {
        dx.describeDXItem(
          token,
          'project-notarealproject:file-notarealfile',
          (error, result) => {
            expect(error).not.toBeNull();
            expect(result).toBeNull();
            if (error) {
              expect(error.message).toEqual(
                'The specified URL could not be found',
              );
            }
            done();
          },
        );
      });

      it('should be able to download a small file correctly.', done => {
        dx.describeDXItem(token, file, (error, result) => {
          expect(error).toBeNull();
          expect(result).not.toBeNull();

          if (result) {
            // File must be 1Mb or less.
            const remoteFileSize = result.size;
            expect(remoteFileSize).toBeLessThanOrEqual(1e6);
            const _tmpdir = tmp.dirSync().name;
            const localFilePath = path.join(_tmpdir, 'file');

            dx.downloadDxFile(
              token,
              `:${result.id}`,
              'file',
              result.size,
              _tmpdir,
              null,
              (error, result) => {
                expect(error).toBeNull();
                expect(result).toBeTruthy();
                const localFileSize = statSync(localFilePath).size;
                expect(localFileSize).toEqual(remoteFileSize);
                rimraf.sync(_tmpdir);
                done();
              },
            );
          } else {
            done();
          }
        });
      });

      it("should error when trying to download a file which doesn't exist.", done => {
        const _tmpdir = tmp.dirSync().name;

        dx.downloadDxFile(
          token,
          'project-notarealproject:file-notarealfile',
          'file',
          0,
          _tmpdir,
          null,
          (error, result) => {
            expect(error).not.toBeNull();
            expect(result).toBeNull();
            if (error) {
              expect(error.message).toEqual(
                '"file-notarealfile" is not a recognized ID',
              );
            }
            done();
          },
        );
      });
    }

    if (process.env.DXPROJECT) {
      const project = process.env.DXPROJECT;

      it('should list downloadable files in a valid dx-project', done => {
        dx.listDownloadableFiles(token, project, true, (error, resp) => {
          expect(error).toBeNull();
          expect(resp).not.toBeNull();

          if (resp) {
            expect(resp.length).toBeGreaterThanOrEqual(1);
            const firstResult = resp[0];
            const firstResultKeys = Object.keys(firstResult);
            expect(firstResultKeys).toContain('project');
            expect(firstResultKeys).toContain('id');
            // @TODO: describe is optional, so ignore for now.
          }
          done();
        });
      });

      it('should throw an error for an invalid project.', done => {
        dx.listDownloadableFiles(
          token,
          'project-notarealproject',
          true,
          (error, resp) => {
            expect(error).not.toBeNull();
            expect(resp).toBeNull();
            if (error) {
              expect(error.message).toEqual(
                '"project-notarealproject" is not a recognized ID',
              );
            }
            done();
          },
        );
      });

      it('should upload a valid text file without erroring.', done => {
        const file: SJDTAFile = {
          name: 'file',
          raw_size: 13,
          size: '13 B',
          status: 0,
          checked: false,
          waiting: false,
          started: false,
          finished: false,
          path: path.resolve(__dirname, '..', '..', 'testdata', 'sample.txt'),
        };

        dx.uploadFile(
          token,
          file,
          project,
          result => {
            console.log(result);
          },
          (error, result) => {
            expect(error).toBeNull();
            expect(result).not.toBeNull();
            // @TODO: improve this once dx.uploadFile returns a better callback result.
            done();
          },
        );
      });
    }
  });
}
