/**
 * The following environment variables are required to run these tests.
 *
 *   - DXTOKEN:   a valid DX token to login with.
 *   - DXFILE:    a representative file which we have access to.
 *   - DXPROJECT: a project Id that contains at least one file (preferably the
 *       one pointed to by DXFILE).
 **/

import * as path from 'path';
import {statSync} from 'fs';

import * as tmp from 'tmp';
import {error} from 'util';
import * as rimraf from 'rimraf';

import * as dx from './dx';

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

    it('should return false when we are loggedIn with a correct API token.', done => {
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
        dx.describe(token, file, (error, result) => {
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
        dx.describe(token, 'file-notarealfile', (error, result) => {
          expect(error).not.toBeNull();
          expect(result).toBeNull();
          if (error) {
            expect(error.message).toEqual(
              '"file-notarealfile" is not a recognized ID'
            );
          }
          done();
        });
      });

      it('should be able to download a small file correctly.', done => {
        dx.describe(token, file, (error, result) => {
          expect(error).toBeNull();
          expect(result).not.toBeNull();

          if (result) {
            // File must be 1Mb or less.
            const remoteFileSize = result.size;
            expect(remoteFileSize).toBeLessThanOrEqual(1e6);
            const _tmpdir = tmp.dirSync().name;
            const mapping: dx.RemoteLocalFilePair = {
              localFilePath: path.join(_tmpdir, 'file'),
              remoteFilePath: {
                projectId: result.project,
                fileId: result.id,
              },
            };

            dx.downloadFile(token, mapping, null, (error, result) => {
              expect(error).toBeNull();
              expect(result).not.toBeNull();
              expect(result).toBe(true);
              const localFileSize = statSync(mapping.localFilePath).size;
              expect(localFileSize).toEqual(remoteFileSize);
              rimraf.sync(_tmpdir);
              done();
            });
          } else {
            done();
          }
        });
      });

      it("should error when trying to download a file which doesn't exist.", done => {
        const _tmpdir = tmp.dirSync().name;
        const mapping: dx.RemoteLocalFilePair = {
          localFilePath: path.join(_tmpdir, 'file'),
          remoteFilePath: {fileId: 'file-notarealfile'},
        };

        dx.downloadFile(token, mapping, null, (error, result) => {
          expect(error).not.toBeNull();
          expect(result).toBeNull();
          if (error) {
            expect(error.message).toEqual(
              '"file-notarealfile" is not a recognized ID'
            );
          }
          done();
        });
      });
    }

    if (process.env.DXPROJECT) {
      const project = process.env.DXPROJECT;

      it('should list downloadable files in a valid dx-project', done => {
        dx.listFiles(token, project, true, (error, resp) => {
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
        dx.listFiles(token, 'project-notarealproject', true, (error, resp) => {
          expect(error).not.toBeNull();
          expect(resp).toBeNull();
          if (error) {
            expect(error.message).toEqual(
              '"project-notarealproject" is not a recognized ID'
            );
          }
          done();
        });
      });
    }
  });
}
