St. Jude Cloud Destop Application
---------------------------------

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

In all cases the front-end code needs to be compiled before the tool will run using `npm run www` or `npm run www-no-watch` (for one time only). You can develop the front-end using just this command (the web browser should automatically open up to browsersync). Running the official desktop application with require running `npm start` in a seperate terminal window.

Testing
=======

- `ln -s $PWD/test/testdata $PWD/app/testdata`
- `npm test`
