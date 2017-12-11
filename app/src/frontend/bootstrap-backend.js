/**
 * This code block is executed if we are running as an Electron application.
 */

window.dx = require("./bin/backend/dx");
window.dependency = require("./bin/backend/dependency");
window.queue = require("./bin/backend/queue");
window.logging = require("./bin/backend/logging-remote");
window.oauth = require("./bin/backend/oauth");
window.state = require("./bin/backend/state");
window.ui = require("./bin/backend/ui");
window.utils = require("./bin/backend/utils");
