/**
 * This block of code is run if we are in the browser.
 */

// these util global props are referenced in store.js
window.utils = {
  platform: 'n/a',
  downloadLocation: 'n/a',
  readSJCloudFile(filename, callback) {
    callback(
      JSON.stringify({
        token: '',
        showAllFiles: true,
        showAllProjects: true,
        concurrentOperations: 2,
      })
    );
  },
};

function dx(VueApp) {
  return {
    login(token, callback) {
      setTimeout(callback, 1500);
    },
    listProjects(showAllProjects, callback) {
      if (!VueApp) return;

      fetch(`testdata/${VueApp.$store.getters.testdata}.json`)
        .then(response => response.json())
        .then(arr => {
          const tools = [];
          arr.forEach((elem, i) => {
            const item = {
              name: elem.name,
              dx_location:
                'dx_location' in elem
                  ? elem.dx_location
                  : `${elem.name}---${i}`,
              access_level: 5,
              size: elem.size,
              upload: elem.upload,
              download: elem.download,
              loadedAvailableDownloads: true,
              isSJCPTool: 'isSJCPTool' in elem ? elem.isSJCPTool : false,
              SJCPToolURL: '',
            };

            item.download.forEach((f, i) => {
              f.describe = {
                name: f.name,
                size: f.raw_size,
              };
              f.status = 'status' in f ? f.status : 0;
              f.checked = 'checked' in f ? f.checked : false;
              f.waiting = 'waiting' in f ? f.waiting : false;
              f.started = 'started' in f ? f.started : !!f.status;
              f.finished = 'finished' in f ? f.finished : f.status >= 100;
              f.cancelled = 'cancelled' in f ? f.cancelled : false;
              f.dx_location = `${f.name}---${i}`;
              if (f.started && f.status > 0) {
                const dt = 5000;
                f.startTime = +new Date() - dt;
                const rate = f.status === 0 || dt === 0 ? 0.01 : f.status / dt;
                const msRemaining = (100 - f.status) / rate;
                f.timeRemaining = new Date(msRemaining)
                  .toISOString()
                  .substr(11, 8);
              }
            });

            tools.push(item);
          });

          VueApp.$store.commit('setTools', tools);
          if (!tools.length) {
            VueApp.$store.commit('setNoProjectsFound', true);
          }

          if (!VueApp.$store.getters.currTool && tools[0]) {
            VueApp.$store.commit('setCurrToolName', tools[0].dx_location);
          }

          if (VueApp.dataReadyCallback) {
            VueApp.dataReadyCallback();
            delete VueApp.dataReadyCallback;
          }
        })
        .catch(err => console.log(err));
    },
    listDownloadableFiles(projectId, allFiles, callback) {
      if (!window.VueApp) return;

      if (!window.VueApp.$store.getters.testdata) {
        callback(null, []);
      }
    },
    describeDXItem(dnanexusId, callback) {},
    logout(callback) {
      callback();
    },
  };
}

function oauth(VueApp) {
  return {
    getToken(internal, callback) {
      return callback(null, 'abcxyz');
    },
  };
}

function state(VueApp) {
  const token = VueApp.$store.getters.token;

  return {
    getState(token, callback) {
      callback({});
    },
  };
}

function _utils(VueApp) {
  return {
    openExternal(url) {
      window.open(url, '_blank');
    },
    readableFileSize(bytes, roundNumbers = false) {
      if (isNaN(bytes)) {
        return '0 B';
      }
      if (bytes === 0) {
        return '0 GB';
      }

      const thresh = 1000;
      if (Math.abs(bytes) < thresh) {
        return `${bytes} B`;
      }

      const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      let u = -1;

      do {
        bytes /= thresh;
        ++u;
      } while (Math.abs(bytes) >= thresh && u < units.length - 1);

      let number = bytes.toFixed(1);

      if (roundNumbers) {
        number = Math.round(number);
      }

      return `${number} ${units[u]}`;
    },
    readSJCloudFile: window.utils.readSJCloudFile,
    saveToSJCloudFile() {},
    resetFileStatus(file) {
      file.status = 0;
      file.waiting = false;
      file.started = false;
      file.finished = false;
      file.errored = false;
    },
    openDirectoryDialog() {},
  };
}

function queue(VueApp) {
  let numTaskAdded = 0;
  let numTaskCompleted = 0;

  /**
   * Fake progress for file upload/download.
   * @param {*} file
   */
  function fakeProgress(file, VueApp) {
    file.started = false;
    const i = setInterval(() => {
      if (file.status < 100) {
        file.status = currStatus(file.status);
        file.started = true;
      } else if (!file.waiting) {
        file.waiting = true;
        file.timeRemaining = 'Waiting...';
      } else {
        file.waiting = false;
        file.finished = true;
        file.checked = true;
        numTaskCompleted++;
        clearInterval(i);
        if (numTaskCompleted > numTaskAdded) {
          console.log(
            `More tasks completed than added: ${numTaskCompleted} vs ${numTaskAdded}.`
          );
        }
        VueApp.$store.commit('removeOperationProcess', {
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

  return {
    addToolInfoTask(task, callback) {
      if (typeof callback === 'function') callback(null, {});
    },
    removeAllTaskOfType(type) {},
    addDownloadTask(task) {
      const file = task._rawFile;
      if (file.started || file.finished) {
        return;
      }
      numTaskAdded++;
      fakeProgress(file, this);
      VueApp.$store.commit('addOperationProcess', {
        filename: file.dx_location,
      });
    },
  };
}

window.backend = {
  install(Vue, options) {
    const ref = {};

    Vue.prototype.$setBackend = function() {
      if (this.backend) {
        throw 'The $root.backend has already been set.';
      } else {
        this.backend = {
          oauth: oauth(this),
          dx: dx(this),
          state: state(this),
          queue: queue(this),
          utils: _utils(this),
        };
      }
    };
  },
};
