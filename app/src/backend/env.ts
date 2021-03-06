/**
 * @module env
 * @description Utilities relating to the environment of the application.
 */

/**
 * Gets the current Node environment variable value.
 *
 * @returns a Node environment as a string.
 */
export function getEnv(): string {
  if (process.env.NODE_ENV) {
    return process.env.NODE_ENV.toString().toLowerCase();
  }

  return 'production';
}

/**
 * Checks if environment is set to production.
 *
 * @returns {boolean} True if environment is production, false otherwise.
 */
export function isProduction(): boolean {
  const env = getEnv();
  return env === 'production' || env === 'prod';
}

/**
 * Checks if environment is set to development.
 *
 * @returns {boolean} True if environment is development, false otherwise.
 */
export function isDevelopment(): boolean {
  const env = getEnv();
  return env === 'development' || env === 'dev';
}

/**
 * Check if environment is set to testing.
 *
 * @returns {boolean} True if environment is testing, false otherwise.
 */
export function isTesting(): boolean {
  const env = getEnv();
  return env === 'testing' || env === 'test';
}
