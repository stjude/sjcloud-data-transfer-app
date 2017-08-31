const webpack = require("webpack");
const WebpackNotifierPlugin = require("webpack-notifier");
const BrowserSyncPlugin = require("browser-sync-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");


module.exports = function(env={}) {
  const common = {
	  module: {
	    rules: [
	      {
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
	        use: [
	          {
	            loader: "babel-loader",
	            options: {
	              presets: [["es2015", {modules: false}], 'stage-2'],
                plugins: [ "syntax-dynamic-import" ],
	            },
	          },
	        ],
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
			  use: env.NODE_ENV === "production" ? "css-loader?minimize!less-loader" : "css-loader!less-loader",
	        }),
	      },
	    ],
	  },
	  resolve: {
	    modules: ["node_modules"],
	    extensions: [".js", ".vue", ".json"],
	    alias: {
	      vue: "vue/dist/vue.js",
	    },
	  },
  };

  const frontend = {
	  entry: {
	    app: ["./src/vue/main.js"],
	    vendor: ["vue", "vue-router", "jquery", "tippy.js"],
	    less: ["./src/css/app.less"],
	  },
	  output: {
	    path: __dirname + "/app/bin/frontend",
	    filename: "[name].bundle.js",
	    publicPath: ""//,
	    //jsonpFunction: "sjcdappJsonp",
	  },
	  devtool: "source-map",
	  plugins: [
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
	      server: {baseDir: ["app"]},
	    }),
	    new WebpackNotifierPlugin(),
	  ],
  };

  // const backend = {
  //	target: 'node',
  //	entry: './source/app/sys.js',
  //	output: {
  //		path: __dirname + '/app/bin/',
  //		filename: 'backend.bundle.js',
  //		publicPath: 'bin/',
  //		jsonpFunction: 'sjcdsysJsonp'
  //	},
  //	devtool: 'source-map',
  //	plugins: [
  //		new webpack.optimize.ModuleConcatenationPlugin()
  //	]
  // }

  return Object.assign({}, common, frontend);
	  // Object.assign({} , common, backend)
  // ];
};

