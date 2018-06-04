import * as utils from './utils';

describe('SJ Cloud Home', () => {
  it('should create and return a true Success Callback', () => {
    utils.initSJCloudHome((error, result) => {
      expect(error).toBeNull();
      expect(result).toBe(false);
    });
  });
});
