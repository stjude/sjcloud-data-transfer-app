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
    }
  });
}
