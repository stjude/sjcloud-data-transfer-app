const webpack=require('webpack')
const path = require('path')
const WebpackNotifierPlugin = require('webpack-notifier')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports=function (env={}) {
	return {
		entry: {
			app: ['./source/vue/main.js'], 
			vendor: ['vue','vue-router','jquery'],
			//less: ['./source/client/css/app.less']
	    },
		target: 'node',
		output:{
			path: __dirname+'/app/bin',
			filename:'[name].bundle.js',
			publicPath:'bin/',
			jsonpFunction: 'sjcdappJsonp' // for dynamic import
		},
		resolve: {
	      modules: ['node_modules', 'resources/vue', 'vue/', 'vue/vp', 'tests/'],
	      extensions: ['.js', '.vue', '.json'],
	      alias: {
		    vue: 'vue/dist/vue.js'
		  }
	    },
		module:{
			rules:[{
				test: /\.vue$/, 
	        	loader: 'vue-loader' 
	        },{
				test:/\.css$/,
				use: [{
					loader: "style-loader"
				},{
					loader: "css-loader"
				}]
			},{
				test: /\.js$/,
				use: [{
					loader: 'babel-loader',
					options: { 
						presets: [
							['es2015', {modules: false}]
						], 
						plugins: ['syntax-dynamic-import'] 
					}
				}]
			},{ 
	          test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
	          loader: "url-loader?limit=10000&mimetype=application/font-woff"
	        },{ 
	          test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
	          loader: "file-loader"
	        },{
	          test: /\.less$/,
	          use: ExtractTextPlugin.extract({
	            fallback: "style-loader",
	            use: env.NODE_ENV === 'production' ?
	                  "css-loader?minimize!less-loader" :
	                  "css-loader!less-loader"
	          })
	      }]
		},
		devtool:'source-map',

			
		plugins:[
			//new webpack.IgnorePlugin(/jquery/),
			new webpack.optimize.ModuleConcatenationPlugin(),
			new webpack.optimize.CommonsChunkPlugin({name:"vendor", filename:"vendor.bundle.js"}),
	     	new ExtractTextPlugin({filename:"app.bundle.css"}),
			new BrowserSyncPlugin({
		    	host: 'localhost', // replace this with your hostname
		        port: 3057,
		        server: { baseDir: ['app'] }
		    }),
			new WebpackNotifierPlugin()
		]
	}
}
