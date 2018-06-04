export default function(ref) {
  return {
    state: {
      platform: window.utils.platform,
      environment: process.env.NODE_ENV || 'development',
      currPath: 'upload',
      downloadLocation: window.utils.defaultDownloadDir,
      infoTipText: '',
    },
    getters: {
      platform(state, getters) {
        return state.platform;
      },
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
      setInfoTipText(state, text) {
        state.infoTipText = text;
      },
      setTestdata(state, str) {
        state.testdata = str;
      },
    },
    actions: {},
  };
}
