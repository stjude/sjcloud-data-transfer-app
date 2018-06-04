import Vue from 'vue';
import App from './App';
import VueRouter from 'vue-router';
import routes from './routes/routes';

require('./assets/scss/app.scss');

Vue.use(VueRouter);
const router = new VueRouter({
  routes: routes(),
});

new Vue({
  el: '#app',
  components: { App },
  router,
  template: '<App/>',
});
