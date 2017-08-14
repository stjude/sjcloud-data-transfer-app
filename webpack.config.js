const webpack=require('webpack')
const path = require('path')
const WebpackNotifierPlugin = require('webpack-notifier')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')

module.exports={
	entry:'./source/vue/main.js',
	output:{
		path: __dirname+'/app/bin',
		filename:'sjcdapp.js',
		publicPath:'bin/',
		jsonpFunction: 'sjcdappJsonp' // for dynamic import
	},
	module:{
		rules:[
		{
			test: /\.vue$/, 
        	loader: 'vue-loader' 
        },
		{
			test:/\.css$/,
			use: [{
				loader: "style-loader"
			},{
				loader: "css-loader"
			}]
		},
		{
			test: /\.js$/,
			use: [{
				loader: 'babel-loader',
				options: { presets: [['es2015', {modules: false}]], plugins: ['syntax-dynamic-import'] }
			}]
		}
		]
	},
	devtool:'source-map',

		
	plugins:[
		new webpack.IgnorePlugin(/jquery/),
		new webpack.optimize.ModuleConcatenationPlugin(),
		new BrowserSyncPlugin({
	    	host: 'localhost', // replace this with your hostname
	        port: 3057,
	        server: { baseDir: ['app'] }
	    }),
		new WebpackNotifierPlugin()
	]
}
