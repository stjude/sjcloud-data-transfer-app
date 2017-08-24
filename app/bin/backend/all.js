if (window.location.host!='localhost:3057') {
	// electron app
	window.dx = require('./bin/backend/dx');
	window.oauth = require('./bin/backend/oauth');
	window.state = require('./bin/backend/state');
	window.ui = require('./bin/backend/ui');
	window.utils = require('./bin/backend/utils');
} else {
	// for regular browser based testing only
	// mostly for simplified testing of styles, work flow
	window.dx = {
		getToolsInformation(showAllProjects,showAllFiles,callback){
			if (!window.location.search) return [];
			// to-do: write more elegantly
			const testdata=window.location.search.split('testdata=')[1];
			if (!testdata) return [];
				
			setTimeout(()=>{
				fetch('testdata/'+testdata+'.json')
					.then(response=>response.json())
					.then(callback)
					.catch(err=>console.log(err))
			},500)
		},
		install(updateProgress, failProgress, callback) {
			updateProgress("30%", "Downloading...");

			setTimeout(()=>{
				updateProgress("100%", "Success!");
        		return callback(null, true);
			},1500)
		},
		login(token, callback) {
			setTimeout(callback, 1500);
		}
	};

	window.oauth = {
		getToken(internal, callback) {
			return callback(null, "abcxyz");
		}
	};
	window.state = {};
	window.ui = {};
	window.utils = {};
}
