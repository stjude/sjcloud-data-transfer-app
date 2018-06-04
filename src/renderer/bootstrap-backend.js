/**
 * This code block is executed if we are running as an Electron application.
 */

/*
	Todo:
	- transition away from window globals and towards using VueApp backend plugin
	- the various window.* objects below may be deleted, pending review
	- only window.utils is called outside of this file
*/
window.dx = require('./backend/dx');
window.queue = require('./backend/queue');
window.logging = require('./backend/logging-remote');
window.oauth = require('./backend/oauth');
window.state = require('./backend/state');
window.ui = require('./backend/window');
window.utils = require('./backend/utils-old');

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
          dx: require('./backend/dx'),
          queue: require('./backend/queue'),
          logging: require('./backend/logging-remote'),
          oauth: require('./backend/oauth'),
          state: require('./backend/state'),
          ui: require('./backend/window'),
          utils: require('./backend/utils-old'),
        };
      }
    };
  },
};
