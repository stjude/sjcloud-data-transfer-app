import '../../../app/src/frontend/bootstrap-www.js';
import _App from '../../../app/src/frontend/vue/main.js';
import {select} from 'd3-selection'; //

select('body')
  .append('link')
  .attr('rel', 'stylesheet')
  .attr('href', 'https://fonts.googleapis.com/icon?family=Material+Icons');

window._App = _App;

const testsContext = require.context('.', true, /\.spec\.js$/);
testsContext.keys().forEach(testsContext);
