import Vue from "vue";
import Vuex from "vuex";
import Config from "../../config.json";
import globToRegExp from "glob-to-regexp";

Vue.use(Vuex);

/** Plugins **/
const projectToolScopeWatcher = (store) => {
  store.subscribe((mutation, state) => {
    // console.log(mutation);

    if (mutation.type === "setShowAllFiles") {
      store.dispatch("refreshFiles");
    }

    if (mutation.type === "setShowAllProjects") {
      store.dispatch("updateToolsFromRemote", true);
    }
  });
};


/** Helpers **/
function sortFiles(state, files) {
  if (!state.currFileSortKey || state.currFileSortDirection===0) return;
  const i=state.currFileSortDirection;
  const j=-i;

  if (state.currFileSortKey=="filename") {
    files.sort((a, b)=>{
      return a.name < b.name ? i : j;
    });
  } else if (state.currFileSortKey=="size") {
    files.sort((a, b)=>{
      return a.raw_size < b.raw_size ? j : i;
    });
  } else if (state.currFileSortKey=="status") {
    files.sort((a, b)=>{
      if (a.finished && b.finished) return 0;
      else if (a.finished) return i;
      else if (b.finished) return j;
      else if (a.started && b.started) {
        return a.status > b.status ? i : j;
      } else if (a.started) return i;
      else if (b.started) return j;
      else return 0;
    });
  } else if (state.currFileSortKey=="checked") {
    files.sort((a, b)=>a.checked==b.checked ? 0 : a.checked ? i : j);
  }
}

export default new Vuex.Store({
  state: {
    environment: Config.ENVIRONMENT,
    concurrentOperations: Config.DEFAULT_CONCURRENT_OPERATIONS,
    uriProject: "",

    /** Install **/
    downloadStatus: "Downloading...",
    installingDxToolkit: "waiting",

    /** Login **/
    loginState: "waiting",
    token: "",

    /** Upload/Download **/
    currPath: "upload",
    currToolName: "",
    downloadLocation: "~/Downloads/",
    operationProcesses: {},
    tools: [], // see ../tests/testdata/fakeTools.json for expected schema
    noProjectsFound: false,
    showAllFiles: false,
    showAllProjects: false,
    searchTerm: "",
    modals: {
      toolkit: 0,
    },
    currFileSortKey: "",
    currFileSortDirection: 0,
  },
  getters: {
    /** Global **/
    environment(state, getters) {
      return state.environment;
    },
    concurrentOperations(state, getters) {
      return state.concurrentOperations;
    },

    /** Install **/
    installingDxToolkit(state, getters) {
      return state.installingDxToolkit;
    },
    downloadStatus(state, getters) {
      return state.downloadStatus;
    },

    /** Login **/
    loginState(state, getters) {
      return state.loginState;
    },
    token(state, getters) {
      return state.token;
    },

    /** Upload/Download **/
    noProjectsFound(state) {
      return state.noProjectsFound;
    },
    showAllFiles(state) {
      return state.showAllFiles;
    },
    showAllProjects(state) {
      return state.showAllProjects;
    },
    currTool(state) {
      return state.tools.filter((t) => t.name === state.currToolName)[0];
    },
    toolByName(state) {
      return (name) => {
        if (!name) return null;

        let toolsWithName = state.tools.filter((t) => t.name === name);
        if (!toolsWithName || !toolsWithName.length) {
          return null;
        }

        return toolsWithName[0];
      };
    },
    currPath(state) {
      return state.currPath;
    },
    searchTerm(state) {
      return state.searchTerm;
    },
    downloadLocation(state) {
      return state.downloadLocation;
    },
    tool(state) {
      return (name) => state.tools.filter((t) => t.name === name)[0];
    },
    tools(state) {
      return state.tools;
    },
    currFiles(state, getters) {
      const tool = getters.currTool;
      const files = !tool || !Array.isArray(tool[state.currPath]) ? [] : tool[state.currPath];
      sortFiles(state, files);

      if (state.currPath != "download" || !state.searchTerm) {
        return files;
      } else {
        const rgx=globToRegExp(state.searchTerm, {flags: "gim"});
        return files.filter((f) => {
          return rgx.test(f.name) || rgx.test(""+f.size);
        });
      }
    },
    currFileSortKey(state) {
      return state.currFileSortKey;
    },
    checkedFiles(state, getters) {
      const tool = getters.currTool;
      return !tool || !Array.isArray(tool[state.currPath]) ? []
        : tool[state.currPath].filter((f) => f.checked);
    },
    uriProject(state, getters) {
      return state.uriProject;
    },
    hasFilesInStaging(state, getters) {
      const checkedFiles = getters.checkedFiles;
      if (!checkedFiles.length) {
        return false;
      };

      for (let i = 0; i < checkedFiles.length; i++) {
        if (checkedFiles[i].status == 0 &&
            !checkedFiles[i].waiting &&
            !checkedFiles[i].started &&
            !checkedFiles[i].finished) {
          return true;
        }
      }

      return false;
    },
    hasFilesInTransit(state, getters) {
      const checkedFiles = getters.checkedFiles;
      if (!checkedFiles.length) {
        return false;
      };

      for (let i = 0; i < checkedFiles.length; i++) {
        if (checkedFiles[i].status > 0 && checkedFiles[i].status < 100) {
          return true;
        }
      }

      return false;
    },
    transferComplete(state, getters) {
      const currFiles = getters.currFiles.filter((f) => f.started);
      if (!currFiles.length) {
        return false;
      };

      for (let i = 0; i < currFiles.length; i++) {
        if (
          (currFiles[i].waiting || currFiles[i].started) // either waiting or started
          && !currFiles[i].finished // and not finished
        ) {
          return false;
        }
      }

      return true;
    },
    modalVisibility(state, getters) {
      return (name) => state.modals[name];
    },
  },
  mutations: {
    setURIProject(state, value) {
      state.uriProject = value;
    },

    /** Install **/
    setInstallingDxToolkit(state, installing) {
      state.installingDxToolkit = installing;
    },
    setDownloadStatus(state, status) {
      state.downloadStatus = status;
    },

    /** Login **/
    setLoginState(state, status) {
      state.loginState = status;
    },
    setToken(state, token) {
      state.token = token;
    },

    /** Upload/Download **/
    setNoProjectsFound(state, value) {
      state.noProjectsFound = value;
    },
    setShowAllFiles(state, value) {
      state.showAllFiles = value;
    },
    setShowAllProjects(state, value) {
      state.showAllProjects = value;
    },
    setTools(state, tools) {
      state.tools.splice(0, state.tools.length, ...tools);
    },
    setCurrToolName(state, toolName, removeURI=false) {
      state.searchTerm = "";
      state.currToolName = toolName;
      let tools = state.tools.filter((t) => t.name === toolName);

      if (!tools || !tools.length) {
        if (!state.tools || !state.tools.length) {
          console.log("Appears the tools haven't loaded yet.");
          return;
        } else {
          console.error("Could not find tool:", toolName);
          return;
        }
      }

      let tool = tools[0];
      if (!tool.download.length) {
        window.dx.listDownloadableFiles(
          tool.dx_location,
          state.showAllFiles,
          (err, files) => {
            /* TO-DO: there must be a better place for this test data handling */
            if (window.location.host == "localhost:3057" || window.testdata) {
              state.tools.splice(0, state.tools.length, ...files);
              tool.loadedAvailableDownloads = true;
              tool.download = state.tools.filter((t) => {
                t.raw_size = t.size;
                t.waiting = 0;
                t.started = false;
                return t.name == toolName;
              })[0].download;
              return;
            }

            let downloadableFiles = [];

            files.forEach((elem) => {
              if (isNaN(elem.describe.size)) {
                console.error("Handle this NaN case:", elem);
              }

              let dl_file = {
                name: elem.describe.name,
                status: 0,
                checked: false,
                waiting: false,
                started: false,
                finished: false,
                cancelled: false,
                size: window.utils.readableFileSize(elem.describe.size),
                raw_size: elem.describe.size,
                dx_location: elem.project + ":" + elem.id,
              };

              downloadableFiles.push(dl_file);
            });

            tool.loadedAvailableDownloads = true;
            tool.download = downloadableFiles;

            if (removeURI) {
              state.uriProject = "";
            }
          }
        );
      }
    },
    setCurrPath(state, path) {
      state.currPath = path;
    },
    setDownloadLocation(state, location) {
      state.downloadLocation = location;
    },
    addFile(state, file, checked) {
      const tool = state.tools.filter((t) => t.name === state.currToolName)[0];
      if (!tool || !tool[state.currPath]) {
        console.log(`Invalid tool name '${state.currToolName}' and/or path='${state.currPath}'.`);
        return;
      }

      tool[state.currPath].push(file);
    },
    addFiles(state, files) {
      const tool = state.tools.filter((t) => t.name === state.currToolName)[0];
      if (!tool || !tool[state.currPath]) {
        console.log(`Invalid tool name '${state.currToolName}' and/or path='${state.currPath}'.`);
        return;
      }

      const currFiles = tool[state.currPath];
      files.forEach((f) => {
        const thisFile = {
          name: f.name,
          size: f.size,
          status: 0,
          checked: false,
        };
        currFiles.push(thisFile);
      });
    },
    removeCheckedFiles(state) {
      const tool = state.tools.filter((t) => t.name === state.currToolName)[0];
      if (!tool || !tool[state.currPath]) {
        console.log(`Invalid tool name '${state.currToolName}' and/or path='${state.currPath}'.`);
        return;
      }

      tool[state.currPath] = tool[state.currPath].filter((t) => !t.checked);
    },
    removeAllFiles(state) {
      const tool = state.tools.filter((t) => t.name === state.currToolName)[0];
      if (!tool || !tool[state.currPath]) {
        console.log(`Invalid tool name '${state.currToolName}' and/or path='${state.currPath}'.`);
        return;
      }

      tool[state.currPath] = [];
    },
    cancelCheckedFiles(state) {
      const tool = state.tools.filter((t) => t.name === state.currToolName)[0];
      if (!tool || !tool[state.currPath]) {
        console.log(`Invalid tool name '${state.currToolName}' and/or path='${state.currPath}'.`);
        return;
      }

      let files = tool[state.currPath].filter((t) => t.checked && t.started && !t.finished);
      files.forEach((elem) => {
        elem.cancelled = true;
        let process = state.operationProcesses[elem.name];
        window.utils.killProcess(process.pid);
      });
    },
    setSearchTerm(state, term) {
      state.searchTerm = term;
    },
    setFileSorting(state, obj) {
      state.currFileSortKey = obj.key;
      state.currFileSortDirection = obj.direction;
    },

    /** Modals **/
    showModal(state, name) {
      state.modals[name] = 1;
    },
    hideModal(state, name) {
      state.modals[name] = 0;
    },

    /** Operation Processes **/
    addOperationProcess(state, info) {
      state.operationProcesses[info.filename] = info.process;
    },
    removeOperationProcess(state, info) {
      delete state.operationProcesses[info.filename];
    },

  },
  actions: {
    refreshFiles({commit, state}) {
      state.tools.forEach((tool) => {
        tool.upload = [];
        tool.download = [];
        tool.loadedAvailableDownloads = false;
      });
      // reset curr tool name to refresh downloads.
      commit("setCurrToolName", state.currToolName);
    },
    updateCurrentToolFromURI({commit, state, getters}) {
      console.log("Updating current tool from URI.");
      let projectToPick = getters.uriProject;
      if (!projectToPick) return false;

      let tool = getters.toolByName(projectToPick);
      if (!tool) {
        // TODO: add red alert here to say project could not be picked.
        console.error(`Could not pick project (does not exist): ${tool}`);
        return false;
      }

      console.log(`Selecting project: ${projectToPick}`);
      commit("setCurrToolName", projectToPick);
      window.utils.setURIProject(undefined);
      return true;
    },
    updateToolsFromRemote({commit, state, getters, dispatch}, force=false) {
      let previousTool = state.currToolName;

      commit("setNoProjectsFound", false);

      /** TODO: this is not an elegant solution. **/
      let uploadMap = {};
      state.tools.forEach((tool) => {
        uploadMap[tool.dx_location] = tool.upload;
      });

      if (force) state.tools = [];

      if (!state.tools.length) {
        window.dx.listProjects(
          state.showAllProjects,
          (err, results) => {
            if (results.length > 0) {
              commit("setNoProjectsFound", false);

              let tools = [];
              results.forEach((elem) => {
                let item = {
                  name: elem.project_name,
                  dx_location: elem.dx_location,
                  access_level: elem.access_level,
                  size: "",
                  upload: [],
                  download: [],
                  loadedAvailableDownloads: false,
                  isSJCPTool: false,
                  SJCPToolURL: "",
                };

                /** TODO: see todo above **/
                if (item.dx_location in uploadMap) {
                  item.upload = uploadMap[item.dx_location];
                }

                tools.push(item);
              });

              commit("setTools", tools);

              let resetCurrToolName = true;
              for (let i = 0; i < tools.length; i++) {
                let tool = tools[i];
                if (tool.name === previousTool) {
                  resetCurrToolName = false;
                  break;
                };
              }

              if (getters.uriProject) {
                commit("setCurrToolName", getters.uriProject, true);
              } else {
                if (resetCurrToolName) {
                  commit("setCurrToolName", tools[0].name);
                }
              }

              tools.forEach((elem) => {
                window.queue.addToolInfoTask({
                  _rawTool: elem,
                });
              });
            } else {
              commit("setNoProjectsFound", true);
            }
          }
        );
      }
    },
  },
  plugins: [projectToolScopeWatcher],
});
