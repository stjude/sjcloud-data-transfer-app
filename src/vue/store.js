import Vue from "vue";
import Vuex from "vuex";
import fakeProgress from "../../tests/fakeProgress";

Vue.use(Vuex);

const environment = "prod";
const tools = environment == "dev" ?
  [{
    name: "Rapid RNA-Seq",
    size: 168,
    upload: [
      {name: "file_u1", size: 12, status: 0, checked: false, finished: false},
      {name: "file_u2", size: 10, status: 0, checked: false, finished: false},
      {name: "file_u3", size: 8, status: 0, checked: false, finished: false},
      {name: "file_u4", size: 16, status: 0, checked: false, finished: false},
      {name: "file_u5", size: 20, status: 0, checked: false, finished: false},
      {name: "file_u6", size: 5, status: 0, checked: false, finished: false},
      {name: "file_u7", size: 11, status: 0, checked: false, finished: false},
    ],
    download: [
      {name: "file_d1", size: 12, status: 0, checked: false, finished: false},
      {name: "file_d2", size: 10, status: 0, checked: false, finished: false},
      {name: "file_d3", size: 8, status: 0, checked: false, finished: false},
    ],
  }, {
    name: "WARDEN",
    size: 501,
    upload: [],
    download: [
      {name: "file_dw1", size: 12, status: 0, checked: false, finished: false},
      {name: "file_dw2", size: 10, status: 0, checked: false, finished: false},
      {name: "file_dw3", size: 8, status: 0, checked: false, finished: false},
    ],
  }, {
    name: "ChIP-Seq",
    size: 192,
    upload: [
      {name: "file_uc1", size: 9, status: 0, checked: false, finished: false},
      {name: "file_uc2", size: 101, status: 0, checked: false, finished: false},
    ],
    download: [
      {name: "file_c0", size: 12, status: 0, checked: false, finished: false},
      {name: "file_c1", size: 12, status: 0, checked: false, finished: false},
      {name: "file_c2", size: 10, status: 0, checked: false, finished: false},
      {name: "file_c3", size: 8, status: 0, checked: false, finished: false},
      {name: "file_c4", size: 16, status: 0, checked: false, finished: false},
      {name: "file_c5", size: 20, status: 0, checked: false, finished: false},
      {name: "file_s1", size: 12, status: 0, checked: false, finished: false},
      {name: "file_s2", size: 10, status: 0, checked: false, finished: false},
      {name: "file_s3", size: 8, status: 0, checked: false, finished: false},
      {name: "file_s4", size: 16, status: 0, checked: false, finished: false},
      {name: "file_s5", size: 20, status: 0, checked: false, finished: false},
      {name: "file_s1", size: 12, status: 0, checked: false, finished: false},
      {name: "file_s2", size: 10, status: 0, checked: false, finished: false},
      {name: "file_s3", size: 8, status: 0, checked: false, finished: false},
      {name: "file_s4", size: 16, status: 0, checked: false, finished: false},
      {name: "file_s5", size: 20, status: 0, checked: false, finished: false},
    ],
  }] : [];

/** Plugins **/
const projectToolScopeWatcher = (store) => {
  store.subscribe((mutation, state) => {
    if (mutation.type === "setShowAllFiles" ||
        mutation.type === "setShowAllProjects") {
      store.dispatch("updateToolsFromRemote", true);
    }

    console.log(mutation);
  });
};

export default new Vuex.Store({
  state: {
    environment,

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
    tools,
    showAllFiles: false,
    showAllProjects: false,
  },
  getters: {
    /** Global **/
    environment(state, getters) {
      return state.environment;
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
    showAllFiles(state) {
      return state.showAllFiles;
    },
    showAllProjects(state) {
      return state.showAllProjects;
    },
    currTool(state) {
      return state.tools.filter((t)=>t.name==state.currToolName)[0];
    },
    currPath(state) {
      return state.currPath;
    },
    downloadLocation(state) {
      return state.downloadLocation;
    },
    tool(state) {
      return (name)=>state.tools.filter((t)=>t.name==name)[0];
    },
    tools(state) {
      return state.tools;
    },
    currFiles(state, getters) {
	    const tool=getters.currTool;
      return !tool || !Array.isArray(tool[state.currPath]) ? [] : tool[state.currPath];
    },
    checkedFiles(state, getters) {
      const tool=getters.currTool;
      return !tool || !Array.isArray(tool[state.currPath]) ? []
        : tool[state.currPath].filter((f)=>f.checked);
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
    },
    setCurrPath(state, path) {
      state.currPath=path;
    },
    setDownloadLocation(state, location) {
      state.downloadLocation = location;
    },
  },
  actions: {
    updateToolsFromRemote({commit, state}, force=false) {
      let previousTool = state.currToolName;

      if (force) state.tools = [];

      if (!state.tools.length) {
        window.dx.getToolsInformation(
          state.showAllProjects,
          state.showAllFiles,
          (results) => {
            if (results.length > 0) {
              commit("setTools", results);
              for (let i = 0; i < results.length; i++) {
                let result = results[i];
                if (result.name === previousTool) return;
              }
              commit("setCurrToolName", results[0].name);
            }
          });
      }
    },
  },
  plugins: [projectToolScopeWatcher],
});
