import { getEnv, isDevelopment, isProduction, isTesting } from './env';

let previousNodeEnv: string | undefined;

beforeEach(() => {
  previousNodeEnv = process.env.NODE_ENV;
});

afterEach(() => {
  process.env.NODE_ENV = previousNodeEnv;
});

describe('getEnv', () => {
  describe('NODE_ENV is set', () => {
    it('returns the lowercase version of NODE_ENV', () => {
      process.env.NODE_ENV = 'TESTING';
      expect(getEnv()).toBe('testing');
    });
  });

  describe('NODE_ENV is not set', () => {
    it('defaults to production', () => {
      delete process.env.NODE_ENV;
      expect(getEnv()).toBe('production');
    });
  });
});

describe('isDevelopment', () => {
  it('returns whether NODE_ENV is set to dev[elopment]', () => {
    process.env.NODE_ENV = 'development';
    expect(isDevelopment()).toBe(true);
    process.env.NODE_ENV = 'dev';
    expect(isDevelopment()).toBe(true);
    process.env.NODE_ENV = 'production';
    expect(isDevelopment()).toBe(false);
  });
});

describe('isProduction', () => {
  it('returns whether NODE_ENV is set to prod[uction]', () => {
    process.env.NODE_ENV = 'production';
    expect(isProduction()).toBe(true);
    process.env.NODE_ENV = 'prod';
    expect(isProduction()).toBe(true);
    process.env.NODE_ENV = 'development';
    expect(isProduction()).toBe(false);
  });
});

describe('isTesting', () => {
  it('returns whether NODE_ENV is set to test[ing]', () => {
    process.env.NODE_ENV = 'testing';
    expect(isTesting()).toBe(true);
    process.env.NODE_ENV = 'test';
    expect(isTesting()).toBe(true);
    process.env.NODE_ENV = 'production';
    expect(isTesting()).toBe(false);
  });
});
