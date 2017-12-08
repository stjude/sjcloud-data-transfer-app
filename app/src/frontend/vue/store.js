import Vue from "vue";
import Vuex from "vuex";
import Config from "../../../../config.json";
import storeStart from "./substores/storeStart";
import storeModals from "./substores/storeModals";
import storeProjects from "./substores/storeProjects";
import storeFiles from "./substores/storeFiles";
import storeOperations from "./substores/storeOperations";

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
    infoTipText: ''
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
    infoTipText(state) {
      return state.infoTipText;
    }
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
    setInfoTipText(state,text) {
      state.infoTipText = text;
    },
    setTestdata(state, str) {
      state.testdata = str;
    },
  },
  actions: {}
};

/** Store generator **/
function storeCopier(key,substores) {
  const copy={};
  substores.forEach(substore=>{
    if (key in substore) Object.assign(copy, substore[key])
  });
  return copy;
}

export default function getVuexStore(cachedState = {}) {
  const substores = [storeGlobal, storeStart, storeModals, storeProjects, storeFiles, storeOperations];
  /*
    To-Do: use Vuex.modules instead of Object.assign in storeCopier
  */
  return new Vuex.Store({
    state: storeCopier('state', substores.concat({state: cachedState}, {state: getParams()})),
    getters: storeCopier('getters', substores),
    mutations: storeCopier('mutations', substores),
    actions: storeCopier('actions', substores),
    plugins: [projectToolScopeWatcher],
  });
}
