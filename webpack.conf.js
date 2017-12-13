const path = require("path");
const webpack = require("webpack");
const WebpackNotifierPlugin = require("webpack-notifier");
const BrowserSyncPlugin = require("browser-sync-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  module: {
    rules: [{
      test: /\.vue$/,
      loader: "vue-loader",
    }, {
      test: /\.css$/,
      use: [
        {loader: "style-loader"},
        {loader: "css-loader"},
      ],
    }, {
      test: /\.js$/,
      use: [{
        loader: "babel-loader",
        options: {
          presets: [["es2015", {modules: false}], "stage-2"],
          plugins: ["syntax-dynamic-import"],
        },
      }],
    }, {
      test: /\.tsx?$/,
      use: "ts-loader",
      exclude: /node_modules/,
    }, {
      test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: "url-loader?limit=10000&mimetype=application/font-woff",
    }, {
      test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: "file-loader",
    }, {
      test: /\.less$/,
      use: ExtractTextPlugin.extract({
        fallback: "style-loader",
        use: "css-loader!less-loader",
      }),
    }],
  },
  resolve: {
    modules: ["node_modules"],
    extensions: [".ts", ".tsx", ".js", ".vue", ".json"],
    alias: {
      vue: "vue/dist/vue.js",
      quasar: "quasar-framework",
    },
  },
  entry: {
    app: ["./app/src/frontend/vue/main.js"],
    vendor: ["vue", "vue-router", "jquery", "tippy.js"],
    less: ["./app/src/frontend/css/app.less"],
  },
  output: {
    path: path.join(__dirname, "app/bin/frontend"),
    filename: "[name].bundle.js",
    publicPath: "",
    jsonpFunction: "sjcdappJsonp",
  },
  devtool: "source-map",
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || "production"),
      },
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      filename: "vendor.bundle.js",
    }),
    new ExtractTextPlugin({
      filename: "app.bundle.css",
    }),
    new BrowserSyncPlugin({
      host: "localhost",
      port: 3057,
      startPath: "?testdata=fakeTools",
      server: {
        baseDir: "app",
        index: "www.html"
      },
    }),
    new WebpackNotifierPlugin(),
  ],
};
