import Vue from 'vue';
import Vuex from 'vuex';
import App from './App';
import VueRouter from 'vue-router';
import store from './stores/store';
import routes from './routes/routes';

require('./assets/scss/app.scss');

Vue.use(Vuex);
Vue.use(VueRouter);

const router = new VueRouter({
  routes: routes(),
});

new Vue({
  el: '#app',
  components: { App },
  store,
  router,
  template: '<App/>',
});
