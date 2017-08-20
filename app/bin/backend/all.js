if (window.location.host=='localhost:3057') {
	window.dx = {};
	window.oauth = {};
	window.state = {};
	window.ui = {};
	window.utils = {};
} else {
	window.dx = require('./bin/backend/dx');
	window.oauth = require('./bin/backend/oauth');
	window.state = require('./bin/backend/state');
	window.ui = require('./bin/backend/ui');
	window.utils = require('./bin/backend/utils');
}
