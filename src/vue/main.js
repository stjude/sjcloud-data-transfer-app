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

// boostrap the app
const _App = new Vue({
  el: "#sjcda-main-div",
  render: (h)=>h(App),
  router,
  store,
});

_App.$router.replace("/");

if (Config.ENVIRONMENT === "dev") {
  _App.$router.replace('home');
} else {
  window.state.getState((state) => { _App.$router.replace(state); });
}