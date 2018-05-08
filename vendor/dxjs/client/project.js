'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : {default: mod};
  };
Object.defineProperty(exports, '__esModule', {value: true});
var listFolder_1 = __importDefault(require('../methods/project/listFolder'));
var ProjectClient = /** @class */ (function() {
  function ProjectClient(client) {
    this.client = client;
  }
  ProjectClient.prototype.listFolder = function(projectId, options) {
    if (options === void 0) {
      options = {};
    }
    return listFolder_1.default(this.client, projectId, options);
  };
  return ProjectClient;
})();
exports.default = ProjectClient;
