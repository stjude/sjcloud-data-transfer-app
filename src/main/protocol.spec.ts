import * as protocol from './protocol';

describe('Handle URI', () => {
  it('should return a javascript command when given a sjcloud:// URI', () => {
    expect(protocol.handleURI('sjcloud://test-project')).toEqual(
      `window.uriProject = test-project`,
    );
  });
  it('should return an empty string when given an invalid URI', () => {
    expect(protocol.handleURI('wrongURI://invalid')).toEqual('');
  });
  it('should return an empty string when given an empty string', () => {
    expect(protocol.handleURI('')).toEqual('');
  });
});
