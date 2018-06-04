import Vue from 'vue';
import Vuex from 'vuex';
import storeGlobal from './storeGlobal';
import storeStart from './storeStart';
// import storeModals from './storeModals';
// import storeProjects from './storeProjects';
// import storeFiles from './storeFiles';
// import storeOperations from './storeOperations';

Vue.use(Vuex);

/** Store generator * */
// function storeCopier(key, substores) {
//   const copy = {};
//   substores.forEach(substore => {
//     if (key in substore) Object.assign(copy, substore[key]);
//   });
//   return copy;
// }

export default function getVuexStore(cachedState = {}) {
  const ref = {};
  const substores = [
    storeGlobal(ref),
    storeStart(ref),
    // storeModals(ref),
    // storeProjects(ref),
    // storeFiles(ref),
    // storeOperations(ref),
  ];

  /** Plugins * */
  function projectToolScopeWatcher(store) {
    store.subscribe((mutation, state) => {
      if (mutation.type === 'setShowAllFiles') {
        store.dispatch('refreshFiles');
        cacheState(state);
      }

      if (mutation.type === 'setShowAllProjects') {
        ref.backend.queue.removeAllTaskOfType('toolInfo');
        store.dispatch('updateToolsFromRemote', true);
        cacheState(state);
      }

      if (mutation.type === 'setToken') {
        cacheState(state);
      }

      if (mutation.type === 'setURIProject') {
        store.commit('setCurrToolName', state.uriProject, true);
      }

      if (
        mutation.type !== 'toggleMenu' &&
        mutation.type !== 'closeMenu' &&
        mutation.type !== 'openMenu'
      ) {
        state.menuIsVisible = false;
      }
    });
  }

  /** Helpers * */
  function cacheState(state) {
    ref.backend.utils.saveToSJCloudFile(
      'state.json',
      JSON.stringify({
        token: state.token,
        showAllFiles: state.showAllFiles,
        showAllProjects: state.showAllProjects,
        concurrentOperations: state.concurrentOperations,
      }),
    );
  }

  /*
    To-Do: use Vuex.modules instead of Object.assign in storeCopier
  */
  return {
    setRef(key, val) {
      if (key in ref) {
        throw "The store reference='" + key + "' has already been set";
      } else {
        ref[key] = val;
      }
    },
    main: new Vuex.Store({
      state: storeCopier(
        'state',
        substores.concat({ state: cachedState }, { state: getParams() }),
      ),
      getters: storeCopier('getters', substores),
      mutations: storeCopier('mutations', substores),
      actions: storeCopier('actions', substores),
      plugins: [projectToolScopeWatcher],
    }),
  };
}
