/**
 * @module env
 * @description Determines the environment of the application.
 */

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

/**
 * Gets the current Node Environment variable value.
 *
 * @returns {string} Node environment as a string.
 */
export function getEnv() {
  return process.env.NODE_ENV.toString().toLowerCase();
}

/**
 * Checks if environment is set to production.
 *
 * @returns {boolean} True if environment is production, false otherwise.
 */
export function isProduction() {
  const env = getEnv();
  return env === 'production' || env === 'prod';
}

/**
 * Checks if environment is set to development.
 *
 * @returns {boolean} True if environment is development, false otherwise.
 */
export function isDevelopment() {
  const env = getEnv();
  return env === 'development' || env === 'dev';
}

/**
 * Check if environment is set to testing.
 *
 * @returns {boolean} True if environment is testing, false otherwise.
 */
export function isTesting() {
  const env = getEnv();
  return env === 'testing' || env === 'test';
}

/**
 * Check if environment variable is set to a valid value.
 */
export function checkIsValid() {
  const result = isProduction() || isDevelopment() || isTesting();
  if (!result) {
    throw new Error(`Invalid NODE_ENV: ${process.env.NODE_ENV}!`);
  }
}
