import Vue from "vue";
import VueRouter from "vue-router";
import routes from "./routes.js";
import App from "./App.vue";
import store from "./store";

// configure Vue
Vue.config.debug = true;
Vue.use(VueRouter);

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
