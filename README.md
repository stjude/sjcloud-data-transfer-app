St. Jude Cloud Destop Application
---------------------------------

[![Build Status](https://travis-ci.org/stjude/sjcloud-data-transfer-app.svg?branch=master)](https://travis-ci.org/stjude/sjcloud-data-transfer-app) [![Maintainability](https://api.codeclimate.com/v1/badges/ce7eed7d778bf50ac81a/maintainability)](https://codeclimate.com/github/stjude/sjcloud-data-transfer-app/maintainability) 

A desktop application for the St. Jude Cloud which makes interaction with the
St. Jude Cloud easily accessible from a graphical user interface. There is
functionality to install the
[dx-toolkit](https://github.com/dnanexus/dx-toolkit), log-in to the St. Jude
Cloud (internal and external), and upload/download from the platform.

Install
=======

- `git clone http://cmpb-devops.stjude.org/gitlab/claymcleod/sjcloud_desktop_app.git` to grab the source code.
- `npm install` to install the dependencies.

Development
===========

[![Build Status](https://travis-ci.org/stjude/sjcloud-data-transfer-app.svg?branch=development)](https://travis-ci.org/stjude/sjcloud-data-transfer-app)


In all cases the front-end code needs to be compiled before the tool will run using `npm run www` or `npm run www-no-watch` (for one time only). You can develop the front-end using just this command (the web browser should automatically open up to browsersync). Note that the testdata folder must be symlinked under the app/folder when developing and testing in a regular, non-electron Chrome browser.

Running the official desktop application will require running `npm start` in a separate terminal window.

Testing
=======

Front-end tests
- `ln -s $PWD/test/testdata $PWD/app/testdata`
- `npm run www # if it's not running already`
- `npm test`

Backend tests
- to-do
