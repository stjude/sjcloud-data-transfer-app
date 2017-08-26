import Vue from "vue";
import Vuex from "vuex";
import Config from "../../config.json";
import mapLimit from "async/mapLimit";

Vue.use(Vuex);

/** Plugins **/
const projectToolScopeWatcher = (store) => {
  store.subscribe((mutation, state) => {
    if (mutation.type === "setShowAllFiles") {
      store.dispatch("refreshFiles");
    }

    if (mutation.type === "setShowAllProjects") {
      store.dispatch("updateToolsFromRemote", true);
    }
  });
};

export default new Vuex.Store({
  state: {
    environment: Config.ENVIRONMENT,
    concurrentOperations: Config.DEFAULT_CONCURRENT_OPERATIONS,

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
    tools: [], // see ../tests/testdata/fakeTools.json for expected schema
    noProjectsFound: false,
    showAllFiles: false,
    showAllProjects: false,
    searchTerm: "",
    modals: {
      toolkit: 0,
    },
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
      const files=!tool || !Array.isArray(tool[state.currPath]) ? [] : tool[state.currPath];
      return state.currPath!="download" || !state.searchTerm ? files : files.filter((f)=>{
        return f.name.toLowerCase().includes(state.searchTerm ) ||
          (""+f.size).toLowerCase().includes(state.searchTerm);
      });
    },
    checkedFiles(state, getters) {
      const tool = getters.currTool;
      return !tool || !Array.isArray(tool[state.currPath]) ? []
        : tool[state.currPath].filter((f) => f.checked);
    },
    hasFilesInStaging(state, getters) {
      const checkedFiles = getters.checkedFiles;
      if (!checkedFiles.length) {
        return false;
      };

      for (let i = 0; i < checkedFiles.length; i++) {
        if (checkedFiles[i].status == 0 && !checkedFiles[i].finished) {
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
      const checkedFiles = getters.checkedFiles;
      if (!checkedFiles.length) {
        return false;
      };

      for (let i = 0; i < checkedFiles.length; i++) {
        if (!checkedFiles[i].finished) {
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
    setCurrToolName(state, toolName) {
      state.currToolName = toolName;
      let tool = state.tools.filter((t) => t.name === toolName)[0];

      if (!tool.download.length) {
        window.dx.listDownloadableFiles(
          tool.dx_location,
          state.showAllFiles,
          (err, files) => {
            let downloadableFiles = [];

            files.forEach((elem) => {
              let dl_file = {
                name: elem.describe.name,
                status: 0,
                checked: false,
                waiting: false,
                started: false,
                finished: false,
                size: window.utils.readableFileSize(elem.describe.size),
                raw_size: elem.describe.size,
                dx_location: elem.project + ":" + elem.id,
              };

              downloadableFiles.push(dl_file);
            });

            tool.loadedAvailableDownloads = true;
            tool.download = downloadableFiles;
          }
        );
      }
    },
    setCurrPath(state, path) {
      state.currPath=path;
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
        const this_file = {
          name: f.name,
          size: f.size,
          status: 0,
          checked: false,
        };
        currFiles.push(this_file);
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
    setSearchTerm(state, term) {
      state.searchTerm=term.toLowerCase();
    },

    /** modals **/
    showModal(state, name) {
      state.modals[name]=1;
    },
    hideModal(state, name) {
      state.modals[name]=0;
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
    updateToolsFromRemote({commit, state}, force=false) {
      let previousTool = state.currToolName;

      commit("setNoProjectsFound", false);
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
                };

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

              if (resetCurrToolName) {
                commit("setCurrToolName", tools[0].name);
              }

              mapLimit(tools, 5, (item, callback) => {
                let thisTool = state.tools.filter((t) => t.dx_location == item.dx_location)[0];
                window.dx.describeDXItem(item.dx_location, (err, describe) => {
                  thisTool.size = utils.readableFileSize(describe.dataUsage * 1e9, true);
                  return callback(null, describe);
                });
              }, (err, results) => {});
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
