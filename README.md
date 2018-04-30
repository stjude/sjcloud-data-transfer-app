# St. Jude Cloud Data Transfer Application

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fstjude%2Fsjcloud-data-transfer-app.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fstjude%2Fsjcloud-data-transfer-app?ref=badge_shield)

| **Branch**  | **Version** | **Unix CI**                                                              | **Windows CI**                                                             | **Coverage**                                                              | **Maintainability**                                                           |
| ----------- | ----------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Master      | v1.2.0      | [![Build Status][travis-master-ci-svg]][travis-master-ci-link]           | [![Build status][windows-master-ci-svg]][windows-master-ci-link]           | [![Coverage Status][coverage-master-svg]][coverage-master-link]           | [![Maintainability][maintainability-master-svg]][maintainability-master-link] |
| Development | v1.3.0      | [![Build Status][travis-development-ci-svg]][travis-development-ci-link] | [![Build status][windows-development-ci-svg]][windows-development-ci-link] | [![Coverage Status][coverage-development-svg]][coverage-development-link] |                                                                               |

A desktop application written on top of the [Electron Framework](https://electron.atom.io/) facilitating easy uploading and downloading of genomic data to the St. Jude Cloud. Functionality includes:

* Automatically installing and configuring the [dx-toolkit](https://github.com/dnanexus/dx-toolkit).
* Logging in using OAuth for both internal and external St. Jude users.
* Reliably uploading and downloading genomic data files to/from the platform.

You'll need the following prerequsites installed. We are working on adding support for installing and configuring these automatically.

## Building

You can find the latest built version of the tools on the [releases page](https://github.com/stjude/sjcloud-data-transfer-app/releases). If you'd like to build yourself, you'll also need the following prerequisites installed:

* NodeJS
  * [Install](https://nodejs.org/en/download/)

The process for installing the software in production mode:

```bash
# download repository
git clone git@github.com:stjude/sjcloud-data-transfer-app.git --depth 1

cd sjcloud-data-transfer-app

# install dependencies
yarn install

# copy the example configuration
# if you're on Mac or Linux use
cp config-example.json config.json
# if you're on Windows use
copy config-example.json config.json
# edit as necessary

# NODE_ENV takes on values of 'production' or 'development'.
# Unspecified defaults to production.
# if you're on Mac or Linux use
export NODE_ENV=production
# if you're on Windows use
set NODE_ENV=production

# compile the frontend/backend code.
gulp compile

# start the application
yarn start
```

## Development

Running the tool in development mode requires a few changes to the config:

```bash
# download repository
git clone git@github.com:stjude/sjcloud-data-transfer-app.git

cd sjcloud-data-transfer-app

# install dependencies
yarn install

# copy the example configuration
# if you're on Mac or Linux use
cp config-example.json config.json
# if you're on Windows use
copy config-example.json config.json

# edit the config.json file
# if you're on Mac or Linux you can use
vim config.json
# if you're on Windows you can use
notepad config.json

# NODE_ENV takes on values of 'production' or 'development'.
# Unspecified defaults to production.
# if you're on Mac or Linux use
export NODE_ENV=development
# if you're on Windows use
set NODE_ENV=development

# compile the frontend/backend code.
gulp compile

# start the application
yarn start
```

We recommend that you change the following keys in the config
file.

```javascript
{
    ...
    "AUTOUPDATE_ENABLED": false,
    "CHROMIUM_MENU": true,
    ...
}
```

After making these changes, you are good to go! We recommend that in practice, you use the following command in a separate tab to recompile the code as you make changes:

```bash
# continuously recompile frontend/backend code
gulp develop
```

If you are only working with the front-end code, you can develop in the web browser, which should automatically open up [BrowserSync](https://www.browsersync.io/).

# Testing

End-to-end testing is as simple as running the following command.

```bash
gulp test
```

## Issues

If you have any issues, please file a bug report at the [issues page](https://github.com/stjude/sjcloud-data-transfer-app/issues).

[travis-master-ci-link]: https://travis-ci.org/stjude/sjcloud-data-transfer-app
[travis-master-ci-svg]: https://travis-ci.org/stjude/sjcloud-data-transfer-app.svg?branch=master
[windows-master-ci-link]: https://ci.appveyor.com/project/claymcleod/sjcloud-data-transfer-app/branch/master
[windows-master-ci-svg]: https://ci.appveyor.com/api/projects/status/m0a9yidlkb96sgfi/branch/master?svg=true
[maintainability-master-link]: https://codeclimate.com/github/stjude/sjcloud-data-transfer-app/maintainability
[maintainability-master-svg]: https://api.codeclimate.com/v1/badges/ce7eed7d778bf50ac81a/maintainability
[coverage-master-link]: https://coveralls.io/github/stjude/sjcloud-data-transfer-app?branch=master
[coverage-master-svg]: https://coveralls.io/repos/github/stjude/sjcloud-data-transfer-app/badge.svg?branch=master
[travis-development-ci-link]: https://travis-ci.org/stjude/sjcloud-data-transfer-app
[travis-development-ci-svg]: https://travis-ci.org/stjude/sjcloud-data-transfer-app.svg?branch=development
[windows-development-ci-link]: https://ci.appveyor.com/project/claymcleod/sjcloud-data-transfer-app/branch/development
[windows-development-ci-svg]: https://ci.appveyor.com/api/projects/status/m0a9yidlkb96sgfi/branch/development?svg=true
[coverage-development-link]: https://coveralls.io/github/stjude/sjcloud-data-transfer-app?branch=development
[coverage-development-svg]: https://coveralls.io/repos/github/stjude/sjcloud-data-transfer-app/badge.svg?branch=development
