import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const environment = "prod";

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
    tools: [], // see ../tests/testdata/fakeTools.json for expected schema
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
          (results) => { console.log(results)
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
