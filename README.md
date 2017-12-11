

St. Jude Cloud Data Transfer Application
========================================

[![Build Status](https://travis-ci.org/stjude/sjcloud-data-transfer-app.svg?branch=master)](https://travis-ci.org/stjude/sjcloud-data-transfer-app) [![Build status](https://ci.appveyor.com/api/projects/status/m0a9yidlkb96sgfi/branch/master?svg=true)](https://ci.appveyor.com/project/claymcleod/sjcloud-data-transfer-app/branch/master) [![Maintainability](https://api.codeclimate.com/v1/badges/ce7eed7d778bf50ac81a/maintainability)](https://codeclimate.com/github/stjude/sjcloud-data-transfer-app/maintainability) [![Coverage Status](https://coveralls.io/repos/github/stjude/sjcloud-data-transfer-app/badge.svg?branch=)master](https://coveralls.io/github/stjude/sjcloud-data-transfer-app?branch=master)

A desktop application written on top of the [Electron Framework](https://electron.atom.io/) facilitating easy uploading and downloading of genomic data to the  St. Jude Cloud. Functionality includes:

* Automatically installing and configuring the [dx-toolkit](https://github.com/dnanexus/dx-toolkit).
* Logging in using OAuth for both internal and external St. Jude users.
* Reliably uploading and downloading genomic data files to/from the platform.

You'll need the following prerequsites installed. We are working on adding support for installing and configuring these automatically.

Building
-------

You can find the latest built version of the tools on the [releases page](https://github.com/stjude/sjcloud-data-transfer-app/releases). If you'd like to build yourself, you'll also need the following prerequisites installed:


* NodeJS
    - [Install](https://nodejs.org/en/download/)

The process for installing the software in production mode:

```bash
# download repository
git clone git@github.com:stjude/sjcloud-data-transfer-app.git --depth 1

cd sjcloud-data-transfer-app

# install dependencies
yarn install

# copy the example configuration
# edit as necessary
cp config-example.json config.json 

# NODE_ENV takes on values of 'production' or 'development'.
# Unspecified defaults to production.
export NODE_ENV=production

# compile the frontend/backend code.
gulp develop-once

# start the application
yarn start
```

Development
-----------

[![Build Status](https://travis-ci.org/stjude/sjcloud-data-transfer-app.svg?branch=development)](https://travis-ci.org/stjude/sjcloud-data-transfer-app) [![Build status](https://ci.appveyor.com/api/projects/status/m0a9yidlkb96sgfi/branch/development?svg=true)](https://ci.appveyor.com/project/claymcleod/sjcloud-data-transfer-app/branch/development) [![Coverage Status](https://coveralls.io/repos/github/stjude/sjcloud-data-transfer-app/badge.svg?branch=testing)](https://coveralls.io/github/stjude/sjcloud-data-transfer-app?branch=testing)

Running the tool in development mode requires a few changes to the config:

```bash
# download repository
git clone git@github.com:stjude/sjcloud-data-transfer-app.git

cd sjcloud-data-transfer-app

# install dependencies
yarn install

# copy the example configuration
cp config-example.json config.json 

# edit the config.json file
vim config.json

# NODE_ENV takes on values of 'production' or 'development'.
export NODE_ENV=development

# compile the frontend/backend code.
gulp develop-once

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


Testing
=======

End-to-end testing is as simple as running the following command.

```bash
gulp test
```

Issues
------

If you have any issues, please file a bug report at the [issues page](https://github.com/stjude/sjcloud-data-transfer-app/issues).
