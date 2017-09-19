import Vue from "vue";
import VueRouter from "vue-router";
import routes from "./routes.js";
import App from "./App.vue";
import store from "./store";
import vueTippy from "vue-tippy";
import Config from "../../config.json";

// configure Vue
Vue.config.debug = true;
Vue.use(VueRouter);
Vue.use(vueTippy);

// create router
const router = new VueRouter({
  hashbang: true,
  // transitionOnLoad: true,
  // saveScrollPosition: false,
  routes: routes(),
});

// exporting as a function allows delayed start
// for testing, etc.
export default function _App(selector,cachedState={}) {
  // boostrap the app
  const VueApp = new Vue({
    el: selector,
    render: (h)=>h(App),
    router,
    store: store(cachedState)
  });

  VueApp.$router.replace("/");

  if (Config.ENVIRONMENT === "dev") {
    _App.$router.replace("home");
  } else {
    window.state.getState((state) => {
      VueApp.$router.replace(state); 
    });
  }

  return VueApp;
}

// if this code was bundled and included in index.html,
// where the expected container div is present, 
// then start the app immediately
if (document.querySelector('#sjcda-main-div')) {
  window.utils.readCachedFile('state.json', function(content) {
    const obj=JSON.parse(content);
    if (!obj) {
      console.log('Error parsing the cached state file.');
      _App("#sjcda-main-div"); 
    } else {
      _App("#sjcda-main-div",obj);
    }
  }, '{}');
}
