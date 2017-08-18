const webpack=require('webpack')

module.exports=function (env={}) {
	return {
		target: 'node',
		entry: ['./source/app/sys.js'],
		output:{
			path: __dirname+'/app/bin/',
			filename:'sys.bundle.js',
			publicPath:'bin/',
			jsonpFunction: 'sjcdsysJsonp'
		},
		resolve: {
	      modules: ['node_modules'],
	      extensions: ['.js', '.json']
	    },
		module:{
			rules:[{
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
			}]
		},
		devtool:'source-map',
	
		plugins:[
			//new webpack.IgnorePlugin(/jquery/),
			new webpack.optimize.ModuleConcatenationPlugin()
		]
	}
}
