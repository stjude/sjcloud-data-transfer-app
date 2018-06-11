'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
var describe_1 = __importDefault(require('../methods/project/describe'));
var listFolder_1 = __importDefault(require('../methods/project/listFolder'));
var newFolder_1 = __importDefault(require('../methods/project/newFolder'));
var removeObjects_1 = __importDefault(
  require('../methods/project/removeObjects'),
);
var ProjectClient = /** @class */ (function() {
  function ProjectClient(client) {
    this.client = client;
  }
  ProjectClient.prototype.describe = function(projectId, options) {
    if (options === void 0) {
      options = {};
    }
    return describe_1.default(this.client, projectId, options);
  };
  ProjectClient.prototype.listFolder = function(projectId, options) {
    if (options === void 0) {
      options = {};
    }
    return listFolder_1.default(this.client, projectId, options);
  };
  ProjectClient.prototype.newFolder = function(projectId, options) {
    return newFolder_1.default(this.client, projectId, options);
  };
  ProjectClient.prototype.removeObjects = function(projectId, options) {
    return removeObjects_1.default(this.client, projectId, options);
  };
  return ProjectClient;
})();
exports.default = ProjectClient;
