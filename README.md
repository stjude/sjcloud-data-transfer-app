# St. Jude Cloud Data Transfer Application

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fstjude%2Fsjcloud-data-transfer-app.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fstjude%2Fsjcloud-data-transfer-app?ref=badge_shield)

| Branch | Version | CI | Coverage |
| ------ | ------- | -- | -------- |
| Master | v1.5.0  | ![Node.js CI][ci-master-link] | [![Coverage Status][coverage-master-svg]][coverage-master-link] |
| Development | v1.5.1 | ![Node.js CI][ci-development-link]] | [![Coverage Status][coverage-development-svg]][coverage-development-link] |

A desktop application written on top of the [Electron Framework](https://electron.atom.io/) facilitating easy uploading and downloading of genomic data to the St. Jude Cloud. Functionality includes:

* Logging in using OAuth for both internal and external St. Jude users.
* Reliably uploading and downloading genomic data files to/from the platform.

You can find the latest built version of the tools on the [releases page](https://github.com/stjude/sjcloud-data-transfer-app/releases).

## Building

### Prerequisites

If you'd like to build yourself, you'll also need the following prerequisites installed:

| **Name** | **Install Link**                                                                                                  |
| -------- | ----------------------------------------------------------------------------------------------------------------- |
| NodeJS   | [Using NVM](https://github.com/creationix/nvm#install-script) or [Official Site](https://nodejs.org/en/download/) |

You must use version 12 of NodeJS and version 6 of NPM. We recommend installing NVM, then running `nvm install 12`.
This will handle installing both the correct Node version and the correct NPM version.

### Process

The process for installing the software in production mode:

```bash
# download repository
git clone git@github.com:stjude/sjcloud-data-transfer-app.git
cd sjcloud-data-transfer-app

npm i                           # install dependencies
export NODE_ENV=production      # set the Node environment. Can be 'production' or 'development'.
# set NODE_ENV=production       # if you're on Windows cmd.exe.
# $Env:NODE_ENV = "production"  # if you're on Windows powershell.
npx gulp compile                # compile the frontend/backend code.
npm start                       # start the application.
```

## Development

Running the tool in development mode requires a few changes to the config:

```bash
# download repository
git clone -b development git@github.com:stjude/sjcloud-data-transfer-app.git
cd sjcloud-data-transfer-app

npm i                              # install dependencies
export NODE_ENV=development        # set the Node environment. Can be 'production' or 'development'.
# set NODE_ENV=development         # if you're on Windows cmd.exe.
# $Env:NODE_ENV="development"      # if you're on Windows powershell.
npx gulp compile                   # compile the frontend/backend code.
npm run start:dev                  # start the application.
```

Note that we recommend that you use the following environment variables when developing:

```bash
export AUTOUPDATE_ENABLED="false"
export CHROMIUM_MENU="true"
# set AUTOUPDATE_ENABLED="false"   # cmd.exe
# set CHROMIUM_MENU="true"         # cmd.exe
# $Env:AUTOUPDATE_ENABLED="false"  # PowerShell
# $Env:CHROMIOM_MENU="true"        # PowerShell
```

We recommend that in practice, you use the following command in a separate tab to recompile the code as you make changes:

```bash
# continuously recompile frontend/backend code
npx gulp develop
```

If you are only working with the front-end code, you can develop in the web browser, which should automatically open up [BrowserSync](https://www.browsersync.io/).

# Testing

End-to-end testing is as simple as running the following command.

```bash
npx gulp test
```

## Issues

If you have any issues, please file a bug report at the [issues page](https://github.com/stjude/sjcloud-data-transfer-app/issues).


[maintainability-master-link]: https://codeclimate.com/github/stjude/sjcloud-data-transfer-app/maintainability
[maintainability-master-svg]: https://api.codeclimate.com/v1/badges/ce7eed7d778bf50ac81a/maintainability
[ci-master-link]: https://github.com/stjude/sjcloud-data-transfer-app/workflows/Node.js%20CI/badge.svg?branch=master
[ci-development-link]: https://github.com/stjude/sjcloud-data-transfer-app/workflows/Node.js%20CI/badge.svg?branch=development
[coverage-master-link]: https://coveralls.io/github/stjude/sjcloud-data-transfer-app?branch=master
[coverage-master-svg]: https://coveralls.io/repos/github/stjude/sjcloud-data-transfer-app/badge.svg?branch=master
[coverage-development-link]: https://coveralls.io/github/stjude/sjcloud-data-transfer-app?branch=development
[coverage-development-svg]: https://coveralls.io/repos/github/stjude/sjcloud-data-transfer-app/badge.svg?branch=development
