const webpackConfig = require("./webpack.conf.js");

module.exports = function(config) {
  // no need to extract css into a file, so  
  // to take out ExtractTextPlugin rule for .less,
  // assumed to be the LAST rule in the rules array
  webpackConfig.module.rules[ webpackConfig.module.rules.length-1 ] = {
    test: /\.less$/,
    use: ["css-loader", "less-loader"]
  };
  // optional plugins are not needed in testing 
  webpackConfig.plugins = [];

  config.set({
    browsers: ["Chrome"],
    frameworks: ["jasmine"],
    files: [
      "./app/bin/frontend/app.bundle.css",
      "./test/frontend/test.index.js",
      // serve assets, script, data file used in testing
      {
        pattern: "./app/testdata/*",
        served: true,
        included: false,
        watched: false,
      },
      {
        pattern: "./app/img/*",
        served: true,
        included: false,
        watched: false,
      },
      {
        pattern: "./app/bin/frontend/*",
        served: true,
        included: false,
        watched: false,
      },
    ],

    // the proxy path-keys below are used in the application
    // in the intial page load and for data requests,
    // and must be mapped to the corresponding
    // karma-served files listed in the "files" properties
    proxies: {
      "/testdata/": "/base/app/testdata/",
      "/img/": "/base/app/img/",
      "/bin/frontend/": "/base/app/bin/frontend/",
    },

    // we will pass the entry file to webpack for bundling.
    preprocessors: {
      "./test/frontend/*.js": ["webpack"],
      "*.js": ["webpack"],
      "*": ["webpack"],
    },

    // use the webpack config
    webpack: webpackConfig,
    singleRun: true,
    client: {
      captureConsole: true,
      mocha: {
        bail: true,
      },
    },

    webpackMiddleware: {
      noInfo: true,
    },
  });
};
