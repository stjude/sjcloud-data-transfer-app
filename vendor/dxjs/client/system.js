'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : {default: mod};
  };
Object.defineProperty(exports, '__esModule', {value: true});
var findDataObjects_1 = __importDefault(
  require('../methods/system/findDataObjects')
);
var findProjects_1 = __importDefault(require('../methods/system/findProjects'));
var SystemClient = /** @class */ (function() {
  function SystemClient(client) {
    this.client = client;
  }
  SystemClient.prototype.findDataObjects = function(options) {
    if (options === void 0) {
      options = {};
    }
    return findDataObjects_1.default(this.client, options);
  };
  /**
   * @param options inputs to the /system/findProjects method
   * @returns a list of projects accessible to the user
   */
  SystemClient.prototype.findProjects = function(options) {
    if (options === void 0) {
      options = {};
    }
    return findProjects_1.default(this.client, options);
  };
  return SystemClient;
})();
exports.default = SystemClient;
