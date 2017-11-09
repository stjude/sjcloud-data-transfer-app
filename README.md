

St. Jude Cloud Data Transfer Application
========================================

[![Build Status](https://travis-ci.org/stjude/sjcloud-data-transfer-app.svg?branch=master)](https://travis-ci.org/stjude/sjcloud-data-transfer-app) [![Maintainability](https://api.codeclimate.com/v1/badges/ce7eed7d778bf50ac81a/maintainability)](https://codeclimate.com/github/stjude/sjcloud-data-transfer-app/maintainability) 

A desktop application written on top of the [Electron Framework](https://electron.atom.io/) facilitating easy uploading and downloading of genomic data to the  St. Jude Cloud. Functionality includes:

* Automatically installing and configuring the [dx-toolkit](https://github.com/dnanexus/dx-toolkit).
* Logging in using OAuth for both internal and external St. Jude users.
* Reliably uploading and downloading genomic data files to/from the platform.

You'll need the following prerequsites installed. We are working on adding support for installing and configuring these automatically.

* Python 2.7.13+
    - [Install](https://www.python.org/downloads/release/python-2714/)
* OpenSSL
    - [Windows](https://wiki.openssl.org/index.php/Binaries)
    - Mac: `brew install openssl`
    - [Other](https://wiki.openssl.org/index.php/Compilation_and_Installation)

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
cp config-example.json config.json 

# run the webpack compilation step for the frontend.
yarn run www-no-watch

# start the application
yarn start
```

Development
-----------

Running the tool in development mode requires a few changes to the config:

```bash
# edit the config.json file
vim config.json
```

We recommend that you change the following keys in the config
 file.

```javascript
{
    "ENVIRONMENT": "dev",
    ...
    "AUTOUPDATE_ENABLED": false,
    "CHROMIUM_MENU": true,
    ...
}
```

After making these changes, you are ready to go! We recommend that you use the following command in the background to continuously recompile the front-end code as you make changes:

```bash
# continuously recompile webpack code
yarn run www
```

If you are only working with the front-end code, you can develop in the web browser, which should automatically open up (BrowserSync)[https://www.browsersync.io/]. 


Testing
=======

You can run the front-end tests by running the following commnands:


```bash
# run the webpack compiler
yarn run www-no-watch 
# or yarn run www in another tab.

# run the testing suite
yarn test
```

Issues
------
=======
Front-end tests
- `yarn run www # if it's not running already`
- `yarn test`
>>>>>>> Move testdata to under app to fix #13

If you have any issues, please file a bug report at the [issues page](https://github.com/stjude/sjcloud-data-transfer-app/issues).
