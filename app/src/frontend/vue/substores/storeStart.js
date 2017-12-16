/*
  To-Do: convert to a Vuex.module for use in store.js
*/

export default {
  state: {
    /** Install * */
    pythonOnPath: true,
    downloadStatus: 'Downloading...',
    installingDependencies: 'waiting',

    /** Login * */
    loginState: 'waiting',
    token: '',
  },
  getters: {
    /** Install * */
    pythonOnPath(state) {
      return state.pythonOnPath;
    },
    installingDependencies(state, getters) {
      return state.installingDependencies;
    },
    downloadStatus(state, getters) {
      return state.downloadStatus;
    },

    /** Login * */
    loginState(state, getters) {
      return state.loginState;
    },
    token(state, getters) {
      return state.token;
    },
  },
  mutations: {
    /** Install * */
    setPythonOnPath(state, onPath) {
      state.pythonOnPath = onPath;
    },
    setInstallingDependencies(state, installing) {
      state.installingDependencies = installing;
    },
    setDownloadStatus(state, status) {
      state.downloadStatus = status;
    },

    /** Login * */
    setLoginState(state, status) {
      state.loginState = status;
      if (status === 'waiting') {
        state.currToolName = '';
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
