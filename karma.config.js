var webpackConfig = require('./webpack.config.js')

// karma.conf.js
module.exports = function (config) {
  const wc = webpackConfig();
  //wc.entry='./src/vue/main.js';
  wc.output={
    path: __dirname + "/app/bin/frontend",
    filename: "sjcda.bundle.js",
    publicPath: ""
  }
  wc.plugins=[];

  config.set({
    browsers: ['Chrome'],
    frameworks: ['jasmine'],
    // this is the entry file for all our tests.
    files: ['./test/*.spec.js'],
    // we will pass the entry file to webpack for bundling.
    preprocessors: {
      './test/*.spec.js': ['webpack'],
      '*.js': ['webpack'],
      '*': ['webpack']
    },
    proxies: {
      '/testdata/': 'http://localhost:3057/testdata/',
      '/img/': 'http://localhost:3057/img/',
      '/bin/frontend/': 'http://localhost:3057/app/bin/frontend/'
    },
    // use the webpack config
    webpack: wc,
    singleRun: false, //true,

    client: {
      captureConsole: true,
      mocha: {
        bail: true
      }
    },

    webpackMiddleware: {
      noInfo: true
    }
  })
}
