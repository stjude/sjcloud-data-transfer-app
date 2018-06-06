/**
 * @module config
 * @description Holds sane defaults for configuration settings that can
 *   be overwritten by environment variables.
 */

interface Config {
  TOOL_PROJECT_TAG: string;
  DATA_PROJECT_TAG: string;
  DOWNLOADABLE_TAG: string;
  NEEDS_ANALYSIS_TAG: string;
  AUTOUPDATE_ENABLED: boolean;
  CHROMIUM_MENU: boolean;
  UPDATE_SERVER: string;
  INTERNAL_LOGIN_URL: string;
}

let config: Config = {
  TOOL_PROJECT_TAG: process.env.TOOL_PROJECT_TAG || 'sjcp-project-tool',
  DATA_PROJECT_TAG: process.env.DATA_PROJECT_TAG || 'sjcp-project-data',
  DOWNLOADABLE_TAG: process.env.DOWNLOADABLE_TAG || 'sjcp-result-file',
  NEEDS_ANALYSIS_TAG: process.env.NEEDS_ANALYSIS_TAG || 'sjcp-input-file',
  AUTOUPDATE_ENABLED: process.env.AUTOUPDATE_ENABLED
    ? process.env.AUTOUPDATE_ENABLED == 'true'
    : true,
  CHROMIUM_MENU: process.env.CHROMIUM_MENU
    ? process.env.CHROMIUM_MENU == 'true'
    : false,
  UPDATE_SERVER: process.env.UPDATE_SERVER || 'https://dta.stjude.cloud',
  INTERNAL_LOGIN_URL:
    process.env.INTERNAL_LOGIN_URL || 'https://cloud.stjude.org',
};

export default config;
