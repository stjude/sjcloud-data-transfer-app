import config from './config';

const envIsClean = (): boolean => {
  const { env } = process;

  return (
    !env.TOOL_PROJECT_TAG &&
    !env.DATA_PROJECT_TAG &&
    !env.DOWNLOADABLE_TAG &&
    !env.NEEDS_ANALYSIS_TAG &&
    !env.AUTOUPDATE_ENABLED &&
    !env.CHROMIUM_MENU &&
    !env.UPDATE_SERVER &&
    !env.INTERNAL_LOGIN_URL
  );
};

if (envIsClean()) {
  it('sets the config to default values', () => {
    expect(config.TOOL_PROJECT_TAG).toBe('sjcp-project-tool');
    expect(config.DATA_PROJECT_TAG).toBe('sjcp-project-data');
    expect(config.DOWNLOADABLE_TAG).toBe('sjcp-result-file');
    expect(config.NEEDS_ANALYSIS_TAG).toBe('sjcp-input-file');
    expect(config.AUTOUPDATE_ENABLED).toBe(true);
    expect(config.CHROMIUM_MENU).toBe(false);
    expect(config.UPDATE_SERVER).toBe('https://dta.stjude.cloud');
    expect(config.INTERNAL_LOGIN_URL).toBe('https://cloud.stjude.org');
  });
}
