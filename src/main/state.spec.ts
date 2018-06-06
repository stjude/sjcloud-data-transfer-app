const sinon = require('sinon');
import { SinonStub } from 'sinon';
import * as os from 'os';

import * as logging from './logging-remote';
import * as utils from './utils';
import * as state from './state';
import * as dx from './dx';

describe('Get state', () => {
  let loggingDebugStub: SinonStub;
  let reportBugStub: SinonStub;

  beforeEach(() => {
    loggingDebugStub = sinon.stub(logging, 'debug');
    reportBugStub = sinon.stub(utils, 'reportBug');
  });

  afterEach(() => {
    loggingDebugStub.restore();
    reportBugStub.restore();
  });

  it('should return unknown for invalid platform', () => {
    let platformStub = sinon.stub(os, 'platform').returns('testPlatform');

    state.getState('invalidToken', result => {
      expect(result).toEqual({ path: 'unknown' });
    });

    platformStub.restore();
  });

  it('should return unknown when it cannot initialize SJCloud home', () => {
    let initSJCloudHomeStub = sinon
      .stub(utils, 'initSJCloudHome')
      .returns('Error', null);

    state.getState('invalidToken', result => {
      expect(result).toEqual({ path: 'unknown' });
    });

    initSJCloudHomeStub.restore();
  });

  it('should return need login if not logged into DNAnexus', () => {
    let initSJCloudHomeStub = sinon
      .stub(utils, 'initSJCloudHome')
      .returns('Error', null);
    let loggedInStub = sinon.stub(dx, 'loggedIn').returns('Error', null);

    state.getState('invalidToken', result => {
      expect(result).toEqual({ path: 'login' });
    });

    loggedInStub.restore();
  });

  it('should return upload if logged into DNAnexus', () => {
    let loggedInStubWithArgsStub = sinon.stub(dx, 'loggedIn');
    loggedInStubWithArgsStub.withArgs('testToken').returns(null, 'Result');

    state.getState('testToken', result => {
      expect(result).toEqual({ path: 'upload' });
    });

    loggedInStubWithArgsStub.restore();
  });
});
