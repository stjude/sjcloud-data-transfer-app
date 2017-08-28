if (window.location.host!="localhost:3057") {
  // electron app
  window.dx = require("./bin/backend/dx");
  window.oauth = require("./bin/backend/oauth");
  window.state = require("./bin/backend/state");
  window.ui = require("./bin/backend/ui");
  window.utils = require("./bin/backend/utils");
} else {
	// for regular browser based testing only
	// mostly for simplified testing of styles, work flow
	window.dx = {
		getToolsInformation(showAllProjects,showAllFiles,callback){
			if (!window.location.search) return [];
			// to-do: write more elegantly
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
        fetch("testdata/"+testdata+".json")
          .then((response)=>response.json())
          .then(callback)
          .catch((err)=>console.log(err));
      }, 500);
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
		},
		listProjects(allProjects, callback) {
			callback(null, [{
	          project_name: 'Tool-Empty',
	          dx_location: 'test',
	          access_level: 5,
	        },{
	          project_name: 'Tool-Loading',
	          dx_location: 'test',
	          access_level: 5,
	        },{
	          project_name: 'Tool-Completed',
	          dx_location: 'test',
	          access_level: 5,
	        },{
	          project_name: 'Tool-Long-List',
	          dx_location: 'test',
	          access_level: 5,
	        },])
		},
		listDownloadableFiles(projectId, allFiles, callback) {
			const testdata=window.location.search.split('testdata=')[1];
			if (!testdata) return [];

			setTimeout(()=>{
				fetch('testdata/'+testdata+'.json')
					.then(response=>response.json())
					.then(arr=>callback(null,arr))
					.catch(err=>console.log(err))
			},500)
		},
		describeDXItem(dnanexusId, callback) {
		  
		}
	};
  window.oauth = {
    getToken(internal, callback) {
      return callback(null, "abcxyz");
    },
  };
  window.state = {};
  window.ui = {};
  window.utils = {
    openExternal(url) {
      window.open(url, "_blank");
    },
  };
}
