import Vue from 'vue';
import App from './App';

require('./assets/scss/app.scss');

new Vue({
  el: '#app',
  components: { App },
  template: '<App/>',
});
