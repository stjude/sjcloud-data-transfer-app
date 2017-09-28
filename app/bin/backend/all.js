if (0) { //(window.location.port != "3057" && window.location.port != "9876"  && !window.testdata) {
  // electron app
  window.dx = require("./bin/backend/dx");
  window.queue = require("./bin/backend/queue");
  window.oauth = require("./bin/backend/oauth");
  window.state = require("./bin/backend/state");
  window.ui = require("./bin/backend/ui");
  window.utils = require("./bin/backend/utils");
} else {
  // for regular browser based testing only
  // mostly for simplified testing of styles, work flow
  //
  // TO-DO: figure out a way to use this from the test directory as helper functions
  //
  const testdata=window.testdata ? window.testdata 
    : window.location.search ? window.location.search.split("testdata=")[1]
    : 'fakeTools';

  window.dx = {
      getToolsInformation(showAllProjects, showAllFiles, callback) {
        if (!window.location.search) return [];
        // to-do: write more elegantly
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
        }, 1500);
      },
      login(token, callback) {
        setTimeout(callback, 1500);
      },
      listProjects(showAllProjects, callback) { 
        if (!window.VueApp) return;

        // !!! Requires a symlink to test/testdata via app/testdata
        fetch("testdata/"+testdata+".json")
          .then((response)=>response.json())
          .then((arr)=>{
            const tools=[]
            arr.forEach((elem,i)=>{
              let item = {
                name: elem.name,
                dx_location: 'dx_location' in elem ? elem.dx_location : elem.name+'---'+i,
                access_level: 5,
                size: elem.size,
                upload: elem.upload,
                download: elem.download,
                loadedAvailableDownloads: true,
                isSJCPTool: 'isSJCPTool' in elem ? elem.isSJCPTool : false,
                SJCPToolURL: "",
              };

              item.download.forEach((f,i)=>{
                f.describe={
                  name: f.name,
                  size: f.raw_size,
                  dx_location: f.name+'---'+i
                };
              });

              tools.push(item);
              if (i===0) window.VueApp.$store.commit('setCurrToolName',item.dx_location);
            });

            window.VueApp.$store.commit('setTools',tools);
          })
          .catch((err)=>console.log(err));
      },
      listDownloadableFiles(projectId, allFiles, callback) {
        if (!window.VueApp) return;

        if (!testdata) {
          callback(null, []);
        } else {
          setTimeout(()=>{
            // !!! Requires a symlink to test/testdata via app/testdata
            fetch("testdata/"+testdata+".json")
              .then((response)=>response.json())
              .then((arr)=>{
                arr.forEach((t)=>{
                  t.download.forEach((f,i)=>{
                    f.describe={
                      name: f.name,
                      size: f.raw_size,
                      dx_location:  'dx_location' in f ? f.dx_location : f.name+'---'+i
                    };
                  });
                });
                window.VueApp.$store.commit('addFiles',arr);
              })
              .catch((err)=>console.log(err));
          }, 500);
        }
      },
      describeDXItem(dnanexusId, callback) {

      },
      logout(callback) {
        callback()
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
    },
    readCachedFile(filename,callback) {
      callback('{"showAllFiles":true,"showAllProjects":true,"concurrentOperations":2}');
    },
    saveToFile() {
      
    },
    resetFileStatus(file) {
      file.status = 0;
      file.waiting = false;
      file.started = false;
      file.finished = false;
      file.errored = false;
    }
  };
  window.queue={
    addToolInfoTask(task,callback) {
      if (typeof callback=='function') callback(null,{});
    },
    removeAllTaskOfType(type) {

    },
    addDownloadTask(file) {

    }
  }
}
