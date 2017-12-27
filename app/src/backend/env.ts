if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "production";
}

export function getEnv() {
  return process.env.NODE_ENV.toString().toLowerCase();
}

export function isProduction() {
  const env = getEnv();
  return env === 'production' || env === 'prod';
}

export function isDevelopment() {
  const env = getEnv();
  return env === 'development' || env === 'dev';
}

export function isTesting() {
  const env = getEnv();
  return env === 'testing' || env === 'test';
}

export function checkIsValid() {
  const result = isProduction() || isDevelopment() || isTesting();
  if (!result) { throw new Error(`Invalid NODE_ENV: ${process.env.NODE_ENV}!`); }
}