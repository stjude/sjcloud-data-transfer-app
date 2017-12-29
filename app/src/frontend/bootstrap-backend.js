/**
 * This code block is executed if we are running as an Electron application.
 */

/*
	Todo: 
	- transition away from window globals and towards using VueApp backend plugin
	- the various window.* objects below may be deleted, pending review
	- only window.utils is called outside of this file
*/
window.dx = require('./bin/backend/dx');
window.dependency = require('./bin/backend/dependency');
window.queue = require('./bin/backend/queue');
window.logging = require('./bin/backend/logging-remote');
window.oauth = require('./bin/backend/oauth');
window.state = require('./bin/backend/state');
window.ui = require('./bin/backend/ui');
window.utils = require('./bin/backend/utils');

/*
*	Transition to using backend 
* 	methods specifically to a VueApp instance,
*	by defining the Vue plugin below 
*/

window.backend = {
  install(Vue, options) {
    Vue.prototype.$setBackend = function() {
      if (this.backend) {
        throw 'The $root.backend has already been set.';
      } else {
        this.backend = {
          dx: require('./bin/backend/dx'),
          dependency: require('./bin/backend/dependency'),
          queue: require('./bin/backend/queue'),
          logging: require('./bin/backend/logging-remote'),
          oauth: require('./bin/backend/oauth'),
          state: require('./bin/backend/state'),
          ui: require('./bin/backend/ui'),
          utils: require('./bin/backend/utils'),
        };
      }
    };
  },
};
