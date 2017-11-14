/*
	To-Do: convert to a Vuex.module for use in store.js
*/

export default {
  state: {
    /** Install **/
    openSSLOnPath: true,
    downloadStatus: "Downloading...",
    installingDxToolkit: "waiting",

    /** Login **/
    loginState: "waiting",
    token: "",
  },
  getters: {
    /** Install **/
    openSSLOnPath(state) {
      return state.openSSLOnPath;
    },
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
  },
  mutations: {
    /** Install **/
    setOpenSSLOnPath(state, onPath) {
      state.openSSLOnPath = onPath;
    },
    setInstallingDxToolkit(state, installing) {
      state.installingDxToolkit = installing;
    },
    setDownloadStatus(state, status) {
      state.downloadStatus = status;
    },

    /** Login **/
    setLoginState(state, status) {
      state.loginState = status;
      if (status == "waiting") {
        state.currToolName = "";
        state.tools.splice(0, state.tools.length);
      }
    },
    setToken(state, token) {
      state.token = token;
    },
  },
  actions: {

  },
};
