import Vue from "vue";
import Vuex from "vuex";
import Config from "../../../../config.json";
import storeStart from "./storeStart";
import storeModals from "./storeModals";
import storeProjects from "./storeProjects";
import storeFiles from "./storeFiles";
import storeOperations from "./storeOperations";

Vue.use(Vuex);

/** Plugins **/
const projectToolScopeWatcher = (store) => {
  store.subscribe((mutation, state) => {
    if (mutation.type === "setShowAllFiles") {
      store.dispatch("refreshFiles");
      cacheState(state);
    }

    if (mutation.type === "setShowAllProjects") {
      window.queue.removeAllTaskOfType("toolInfo");
      store.dispatch("updateToolsFromRemote", true);
      cacheState(state);
    }

    if (mutation.type === "setURIProject") {
      store.commit("setCurrToolName", state.uriProject, true);
    }

    if (mutation.type !== "toggleMenu" && mutation.type !== "closeMenu" && mutation.type !== "openMenu") {
      state.menuIsVisible = false;
    }
  });
};


/** Helpers **/
function cacheState(state) {
  window.utils.saveToSJCloudFile("state.json", JSON.stringify({
    showAllFiles: state.showAllFiles,
    showAllProjects: state.showAllProjects,
    concurrentOperations: state.concurrentOperations,
  }));
}


// a simple search string parser used in testing
// to override state settings
function getParams() {
  if (window.location.port != "3057" && window.location.port != "9876") {
    return {};
  }

  const params = {};
  if (window.testdata) params.testdata = window.testdata;
  window.location.search.substr(1).split("&").forEach((kv) => {
    const [key, value] = kv.split("=");
    params[key] = value;
  });
  return params;
}


/** Global Store **/
const storeGlobal = {
  state: {
    environment: process.env.NODE_ENV || "development",
    currPath: "upload",
    downloadLocation: window.utils.defaultDownloadDir,
    testdata: "",
  },
  getters: {
    environment(state, getters) {
      return state.environment;
    },
    currPath(state) {
      return state.currPath;
    },
    downloadLocation(state) {
      return state.downloadLocation;
    },
    testdata(state) {
      return state.testdata;
    },
  },
  mutations: {
    // generic mutation setter
    // useful for simple value redeclarations and
    // when no logic is used in the mutation
    byKey(state, obj) {
      for (const key in obj) {
        state[key] = obj[key];
      }
    },
    setCurrPath(state, path) {
      state.currPath = path;
    },
    setDownloadLocation(state, location) {
      state.downloadLocation = location;
    },

    setTestdata(state, str) {
      state.testdata = str;
    },
  },
};

/** Store generator **/
export default function getVuexStore(cachedState = {}) {
  /*
    To-Do: use Vuex.modules instead of Object.assign
  */
  return new Vuex.Store({
    state: Object.assign(
      storeGlobal.state,
      storeStart.state,
      storeModals.state,
      storeProjects.state,
      storeFiles.state,
      storeOperations.state,
      cachedState,
      getParams()
    ),
    getters: Object.assign(
      storeGlobal.getters,
      storeStart.getters,
      storeModals.getters,
      storeProjects.getters,
      storeFiles.getters,
      storeOperations.getters
    ),
    mutations: Object.assign(
      storeGlobal.mutations,
      storeStart.mutations,
      storeModals.mutations,
      storeProjects.mutations,
      storeFiles.mutations,
      storeOperations.mutations
    ),
    actions: Object.assign(
      {},
      storeStart.actions,
      storeModals.actions,
      storeProjects.actions,
      storeFiles.actions,
      storeOperations.actions
    ),
    plugins: [projectToolScopeWatcher],
  });
}
