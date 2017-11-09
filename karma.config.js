let webpackConfig = require("./webpack.config.js");

module.exports = function(config) {
  const wc = webpackConfig();

  wc.plugins = [];
  wc.output = {
    path: __dirname + "/app/bin/frontend",
    filename: "sjcda.bundle.js",
    publicPath: "",
  };

  config.set({
    browsers: ["Chrome"],
    frameworks: ["jasmine"],
    files: ["./test/*.spec.js"],

    // we will pass the entry file to webpack for bundling.
    preprocessors: {
      "./test/*.spec.js": ["webpack"],
      "*.js": ["webpack"],
      "*": ["webpack"],
    },
    proxies: {
      "/testdata/": "http://localhost:3057/testdata/",
      "/img/": "http://localhost:3057/img/",
      "/bin/frontend/": "http://localhost:3057/app/bin/frontend/",
    },

    // use the webpack config
    webpack: wc,
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
