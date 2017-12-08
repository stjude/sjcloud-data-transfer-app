if (window.location.port != "3057" && window.location.port != "9876" &&
  !window.testdata) {
  /**
   * This code block is executed if we are running as an Electron application.
   */

  window.dx = require("./bin/backend/dx");
  window.queue = require("./bin/backend/queue");
  window.oauth = require("./bin/backend/oauth");
  window.state = require("./bin/backend/state");
  window.ui = require("./bin/backend/ui");
  window.utils = require("./bin/backend/utils");
} else {
  /**
   * This block of code is run if we are in the browser.
   * @todo Figure out a way to use this from the test directory as helper functions
   */

  window.dx = {
    getToolsInformation(showAllProjects, showAllFiles, callback) {
      if (!window.location.search) return [];
      // to-do: write more elegantly
      setTimeout(() => {
        fetch("testdata/" + window.VueApp.$store.getters.testdata + ".json")
          .then((response) => response.json())
          .then(callback)
          .catch((err) => console.log(err));
      }, 500);
    },
    installDxToolkit(updateProgress, callback) {
      updateProgress([0.3, "Downloading..."]);

      setTimeout(() => {
        updateProgress([0.6, "Verifying..."]);

        setTimeout(() => {
          updateProgress([0.9, "Extracting..."]);

          setTimeout(() => {
            updateProgress([1, "Completed!"]);
            return callback(null, true);
          }, 2000);
        }, 1500);
      },1500);
    },
    login(token, callback) {
      setTimeout(callback, 1500);
    },
    listProjects(showAllProjects, callback) {
      if (!window.VueApp) return;

      fetch("testdata/" + window.VueApp.$store.getters.testdata + ".json")
        .then((response) => response.json())
        .then((arr) => {
          const tools = [];
          arr.forEach((elem, i) => {
            let item = {
              name: elem.name,
              dx_location: "dx_location" in elem ? elem.dx_location : elem.name + "---" + i,
              access_level: 5,
              size: elem.size,
              upload: elem.upload,
              download: elem.download,
              loadedAvailableDownloads: true,
              isSJCPTool: "isSJCPTool" in elem ? elem.isSJCPTool : false,
              SJCPToolURL: "",
            };

            item.download.forEach((f, i) => {
              f.describe = {
                name: f.name,
                size: f.raw_size,
              };
              f.status = "status" in f ? f.status : 0;
              f.checked = "checked" in f ? f.checked : false;
              f.waiting = "waiting" in f ? f.waiting : false;
              f.started = "started" in f ? f.started : f.status ? true : false;
              f.finished = "finished" in f ? f.finished : f.status >= 100 ? true : false;
              f.cancelled = "cancelled" in f ? f.cancelled : false;
              f.dx_location = f.name + "---" + i;
              if (f.started && f.status > 0) {
                const dt = 5000;
                f.startTime = +new Date() - dt;
                const rate = f.status == 0 || dt == 0 ? 0.01 : f.status / dt;
                const msRemaining = (100 - f.status) / rate;
                f.timeRemaining = new Date(msRemaining).toISOString().substr(11, 8);
              }
            });

            tools.push(item);
          });

          window.VueApp.$store.commit("setTools", tools);
          if (!tools.length) {
            window.VueApp.$store.commit("setNoProjectsFound", true);
          }

          if (!window.VueApp.$store.getters.currTool && tools[0]) {
            window.VueApp.$store.commit("setCurrToolName", tools[0].dx_location);
          }
        })
        .catch((err) => console.log(err));
    },
    listDownloadableFiles(projectId, allFiles, callback) {
      if (!window.VueApp) return;

      if (!window.VueApp.$store.getters.testdata) {
        callback(null, []);
      }
    },
    describeDXItem(dnanexusId, callback) {

    },
    logout(callback) {
      callback();
    },
  };
  window.oauth = {
    getToken(internal, callback) {
      return callback(null, "abcxyz");
    },
  };
  window.state = {
    getState(callback) {
      callback({});
    },
  };
  window.ui = {};
  window.utils = {
    openSSLOnPath() {

    },
    pythonOnPath() {

    },
    openExternal(url) {
      window.open(url, "_blank");
    },
    readableFileSize(bytes, roundNumbers = false) {
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

      return number + " " + units[u];
    },
    readSJCloudFile(filename, callback) {
      callback(JSON.stringify({
        showAllFiles: true,
        showAllProjects: true,
        concurrentOperations: 2,
      }));
    },
    saveToSJCloudFile() {

    },
    resetFileStatus(file) {
      file.status = 0;
      file.waiting = false;
      file.started = false;
      file.finished = false;
      file.errored = false;
    },
    openDirectoryDialog() {

    },
  };
  window.queue = {
    addToolInfoTask(task, callback) {
      if (typeof callback == "function") callback(null, {});
    },
    removeAllTaskOfType(type) {

    },
    addDownloadTask(task) {
      const file = task._rawFile;
      if (file.started || file.finished) {
        return;
      }
      numTaskAdded++;
      fakeProgress(file);
      window.VueApp.$store.commit("addOperationProcess", {
        filename: file.dx_location,
      });
    },
  };

  let numTaskAdded = 0;
  let numTaskCompleted = 0;

  /**
   * Fake progress for file upload/download.
   * @param {*} file
   */
  function fakeProgress(file) {
    file.started = false;
    const i = setInterval(() => {
      if (file.status < 100) {
        file.status = currStatus(file.status);
        file.started = true;
      } else if (!file.waiting) {
        file.waiting = true;
        file.timeRemaining = "Waiting...";
      } else {
        file.waiting = false;
        file.finished = true;
        file.checked = true;
        numTaskCompleted++;
        clearInterval(i);
        if (numTaskCompleted > numTaskAdded) {
          console.log("More tasks completed than added: " + numTaskCompleted + " vs " + numTaskAdded + ".");
        };
        window.VueApp.$store.commit("removeOperationProcess", {
          filename: file.dx_location,
        });
      }
    }, 500);
  }

  /**
   *
   * @param {*} status
   * @return {number}
   */
  function currStatus(status) {
    const s = status + Math.ceil(Math.random() * (10 - 2) + 2);
    return s > 100 ? 100 : s;
  }
}
