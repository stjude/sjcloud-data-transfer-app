import {select, event} from 'd3-selection';

select('body').append('link')
.attr('rel', 'stylesheet')
.attr('href', 'https://fonts.googleapis.com/icon?family=Material+Icons');

window.testdata='fakeTools';

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
		const testdata=window.testdata ? window.testdata : window.location.search.split('testdata=')[1];
		if (!testdata) {
			callback(null,[]);
		}
		else {
			setTimeout(()=>{
				fetch('testdata/'+testdata+'.json')
					.then(response=>response.json())
					.then(arr=>{
						arr.forEach(t=>{
							t.download.forEach(f=>{
								f.describe={
									name: f.name,
									size: f.raw_size
								};
							})
						});
						callback(null,arr)
					})
					.catch(err=>console.log(err))
			},500)
		}
	},
	describeDXItem(dnanexusId, callback) {
	  
	}
};

window.oauth = {
	getToken(internal, callback) {
		return callback(null, "abcxyz");
	}
};
window.state = {
	getState() {
			
	}
};
window.ui = {};
window.utils = {
	openExternal(url) {
		window.open(url,'_blank')
	},
	readableFileSize(bytes, roundNumbers=false) {
	  if (isNaN(bytes)) {
	    return "0 B";
	  }
	  if (bytes === 0) {
	    return "0 GB";
	  }

	  let thresh = 1000;
	  if (Math.abs(bytes) < thresh) {
	    return bytes + " B";
	  }

	  let units = ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
	  let u = -1;

	  do {
	    bytes /= thresh;
	    ++u;
	  } while (Math.abs(bytes) >= thresh && u < units.length - 1);

	  let number = bytes.toFixed(1);

	  if (roundNumbers) {
	    number = Math.round(number);
	  }

	  return number+" "+units[u];
	}
};


