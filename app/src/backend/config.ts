interface Config {
  [index: string]: string | boolean | object;
  TOOL_PROJECT_TAG: string;
  DATA_PROJECT_TAG: string;
  DOWNLOADABLE_TAG: string;
  NEEDS_ANALYSIS_TAG: string;
  AUTOUPDATE_ENABLED: boolean;
  CHROMIUM_MENU: boolean;
  UPDATE_SERVER: string;
  DOWNLOAD_INFO: {
    [index: string]: object;
    ANACONDA: {
      [index: string]: object;
      WIN32: {
        [index: string]: object;
        IA32: {
          [index: string]: string;
          URL: string;
          SHA256SUM: string;
        };
        X64: {
          [index: string]: string;
          URL: string;
          SHA256SUM: string;
        };
      };
      DARWIN: {
        [index: string]: string;
        URL: string;
        SHA256SUM: string;
      };
      LINUX: {
        [index: string]: object;
        IA32: {
          [index: string]: string;
          URL: string;
          SHA256SUM: string;
        };
        X64: {
          [index: string]: string;
          URL: string;
          SHA256SUM: string;
        };
      };
    };
  };
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
  DOWNLOAD_INFO: {
    ANACONDA: {
      WIN32: {
        IA32: {
          URL:
            'https://repo.continuum.io/miniconda/Miniconda2-4.3.30-Windows-x86.exe',
          SHA256SUM:
            'b54a970985efed2ce98eb60de1a23525b9d7e6cca2b3b882ee236760a7800fb2',
        },
        X64: {
          URL:
            'https://repo.continuum.io/miniconda/Miniconda2-4.3.30-Windows-x86_64.exe',
          SHA256SUM:
            '9e67187213871504ad3bd9863326f82b02294cdb8fe6ec89bf94f417d47a92b8',
        },
      },
      DARWIN: {
        URL:
          'https://repo.continuum.io/miniconda/Miniconda2-4.3.30-MacOSX-x86_64.sh',
        SHA256SUM:
          '1fa6f0ae3b65fc09ba5156c43a3901c4aad0510735c31f58d1be2a71009416f9',
      },
      LINUX: {
        IA32: {
          URL:
            'https://repo.continuum.io/miniconda/Miniconda2-4.3.30-Linux-x86.sh',
          SHA256SUM:
            '3727dcc1561be246c052d6be210b5fd748bf32407cb7e06d0322fe4f79c77482',
        },
        X64: {
          URL:
            'https://repo.continuum.io/miniconda/Miniconda2-4.3.30-Linux-x86_64.sh',
          SHA256SUM:
            '0891000ca28359e63aa77e613c01f7a88855dedfc0ddc8be31829f3139318cf3',
        },
      },
    },
  },
};

export default config;
