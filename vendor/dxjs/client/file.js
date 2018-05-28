'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : {default: mod};
  };
Object.defineProperty(exports, '__esModule', {value: true});
var addTags_1 = __importDefault(require('../methods/file/addTags'));
var close_1 = __importDefault(require('../methods/file/close'));
var describe_1 = __importDefault(require('../methods/file/describe'));
var download_1 = __importDefault(require('../methods/file/download'));
var new_1 = __importDefault(require('../methods/file/new'));
var upload_1 = __importDefault(require('../methods/file/upload'));
var FileClient = /** @class */ (function() {
  function FileClient(client) {
    this.client = client;
  }
  FileClient.prototype.addTags = function(fileId, options) {
    return addTags_1.default(this.client, fileId, options);
  };
  FileClient.prototype.close = function(fileId) {
    return close_1.default(this.client, fileId);
  };
  FileClient.prototype.describe = function(fileId, options) {
    return describe_1.default(this.client, fileId, options);
  };
  FileClient.prototype.download = function(fileId, options) {
    if (options === void 0) {
      options = {};
    }
    return download_1.default(this.client, fileId, options);
  };
  FileClient.prototype.new = function(options) {
    return new_1.default(this.client, options);
  };
  FileClient.prototype.upload = function(fileId, options) {
    return upload_1.default(this.client, fileId, options);
  };
  return FileClient;
})();
exports.default = FileClient;
