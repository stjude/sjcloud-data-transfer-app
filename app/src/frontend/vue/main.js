import Vue from "vue";
import VueRouter from "vue-router";
import routes from "./routes.js";
import App from "./App.vue";
import store from "./store";
import vueTippy from "vue-tippy";

// configure Vue
Vue.config.debug = true;
Vue.config.devtools = false; // silence message about downloading dev tools
Vue.use(VueRouter);
Vue.use(vueTippy);
console.log("Node Environment: " + process.env.NODE_ENV);

// create router
const router = new VueRouter({
  hashbang: true,
  // transitionOnLoad: true,
  // saveScrollPosition: false,
  routes: routes(),
});

// exporting as a function allows delayed start
// for testing, etc.
export default function _App(selector, cachedState = {}) {
  // boostrap the app
  const VueApp = new Vue({
    el: selector,
    render: (h) => h(App),
    router,
    store: store(cachedState),
  });

  VueApp.$router.replace("/");

  if (process.env.NODE_ENV === "development") {
    VueApp.$router.replace("home");
  } else {
    window.state.getState((state) => {
      VueApp.$router.replace('install');
      if (state.path === "install") {
        checkDependencies(VueApp);
      }
    });
  }
  return VueApp;
}

function getAlertHandler(numExpectedCalls=0) {
  const messages=[];
  let numCalls=0;

  return (message=null)=>{
    numCalls++;
    if (message) {
      messages.push(message);
    }
    if (numCalls==numExpectedCalls && messages.length) {
      VueApp.$store.commit("byKey", {
        alertType: "warning",
        alertMessage: messages.join('<br><br>')
      });
    }
  }
}

function checkDependencies(VueApp) {
  const alertHandler = getAlertHandler(2);
  window.utils.openSSLOnPath((onPath) => {
    VueApp.$store.commit("setOpenSSLOnPath", onPath);
    if (onPath === false) {
      alertHandler(
        "You don't have OpenSSL installed on your system, which is needed to run this program. "
        + "You can download it here: <span class='alert-link' @click.stop='clickHandler($event)'>"
        + "https://wiki.openssl.org/index.php/Binaries</span>"
      );        
    } else {
      alertHandler();
    }
  });
  window.utils.pythonOnPath((onPath) => {
    VueApp.$store.commit("setPythonOnPath", onPath);
    if (onPath === false) {
      alertHandler(
        "You need to have python version 2.7.13+ installed on your path. "
        + "You can download it here: <span class='alert-link' @click.stop='clickHandler($event)'>"
        + "https://www.python.org/downloads/release/python-2714/</span>"
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
