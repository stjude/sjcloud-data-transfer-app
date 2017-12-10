import Vue from "vue";
import VueRouter from "vue-router";
import routes from "./routes.js";
import App from "./App.vue";
import store from "./store";
import vueTippy from "vue-tippy";
import Quasar from "quasar";

// configure Vue
Vue.config.debug = true;
Vue.config.devtools = true;
Vue.use(VueRouter);
Vue.use(vueTippy);
Vue.use(Quasar);
console.log("Node Environment: " + process.env.NODE_ENV);

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
export default function _App(selector, cachedState = {}) {
  // boostrap the app
  const VueApp = new Vue({
    el: selector,
    render: (h) => h(App),
    router,
    store: store(cachedState),
  });

  if (VueApp.$store.getters.testdata) {
    // retain route path for easier testing on the browser
  } else if (process.env.NODE_ENV === "development") {
    VueApp.$router.replace("home");
  } else {
    VueApp.$router.replace("/");
    window.state.getState((state) => { // state.path='install';
      VueApp.$router.replace(state.path);
      if (state.path === "login") {
        checkDependencies(VueApp);
      } else if (state.path === "upload") {
        VueApp.$store.dispatch("updateToolsFromRemote", true);
      }
    });
  }

  return VueApp;
}

/**
 *
 * @param {*} numExpectedCalls
 * @return {*}
 */
function getAlertHandler(numExpectedCalls = 0) {
  const messages = [];
  let numCalls = 0;

  return (message = null) => {
    numCalls++;
    if (message) {
      messages.push(message);
    }
    if (numCalls == numExpectedCalls && messages.length) {
      VueApp.$store.commit("byKey", {
        alertType: "warning",
        alertMessage: messages.join("<br><br>"),
      });
    }
  };
}

/**
 *
 * @param {*} VueApp
 */
function checkDependencies(VueApp) {
  const alertHandler = getAlertHandler(2);
  window.utils.pythonOnPath((onPath) => {
    VueApp.$store.commit("setPythonOnPath", onPath);
    if (onPath === false) {
      alertHandler(
        "Something has gone wrong during your installation process." +
        "Please contact us at <span class='alert-link' " +
        "@click.stop='clickHandler($event)'>https://stjude.cloud/contact" +
        "</span>"
      );
    } else {
      alertHandler();
    }
  });
}

// if this code was bundled and included in index.html,
// where the expected container div is present,
// then start the app immediately
if (document.querySelector("#sjcda-main-div")) {
  window.utils.readSJCloudFile("state.json", function(content) {
    const obj = JSON.parse(content);
    if (!obj) {
      console.log("Error parsing the cached state file.");
      _App("#sjcda-main-div");
    } else {
      _App("#sjcda-main-div", obj);
    }
  }, "{}");
}
