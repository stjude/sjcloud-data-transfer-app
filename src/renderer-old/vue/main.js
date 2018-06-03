import Vue from 'vue';
import VueRouter from 'vue-router';
import routes from './routes.js';
import App from './App.vue';
import store from './store';
import vueTippy from 'vue-tippy';
import Quasar, { Alert } from 'quasar';

// configure Vue
Vue.config.debug = true;
Vue.config.devtools = true;
Vue.use(VueRouter);
Vue.use(vueTippy);
Vue.use(Quasar);
Vue.use(window.backend);
console.log(`Node Environment: ${process.env.NODE_ENV}`);

// create router
const router = new VueRouter({
  hashbang: true,
  // transitionOnLoad: true,
  // saveScrollPosition: false,
  routes: routes(),
});

/**
 * exporting as a function allows delayed start
 * for testing, etc.
 *
 * @param {*} selector
 * @param {*} cachedState
 * @return {*}
 */
export default function _App(
  selector,
  cachedState = {},
  dataReadyCallback = null,
) {
  // boostrap the app
  const newStore = store(cachedState);

  const VueApp = new Vue({
    el: selector,
    render: h => h(App),
    router,
    store: newStore.main,
  });

  VueApp.$setBackend();
  newStore.setRef('backend', VueApp.backend);
  VueApp.dataReadyCallback = dataReadyCallback;

  if (VueApp.$store.getters.testdata) {
    // retain route path for easier testing on the browser
    VueApp.$store.dispatch('updateToolsFromRemote', true);
  } else if (process.env.NODE_ENV === 'development') {
    VueApp.$router.replace('home');
  } else {
    VueApp.$router.replace('/');

    const token = VueApp.$store.getters.token;

    VueApp.backend.state.getState(token, state => {
      VueApp.$router.replace(state.path);
      if (state.path === 'login') {
        // noop
      } else if (state.path === 'upload') {
        VueApp.$store.dispatch('updateToolsFromRemote', true);
      }
    });
  }

  return VueApp;
}

// if this code was bundled and included in index.html,
// where the expected container div is present,
// then start the app immediately. The alternative
// scenario is a test that creates the VueApp as needed.
if (document.querySelector('#sjcda-main-div') && window.utils) {
  window.utils.readSJCloudFile(
    'state.json',
    content => {
      const obj = JSON.parse(content);
      if (!obj) {
        console.log('Error parsing the cached state file.');
        _App('#sjcda-main-div');
      } else {
        _App('#sjcda-main-div', obj);
      }
    },
    '{}',
  );
}
