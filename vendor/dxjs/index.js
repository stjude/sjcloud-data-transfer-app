'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
var client_1 = __importDefault(require('./client'));
exports.Client = client_1.default;
var error_1 = __importDefault(require('./methods/error'));
exports.DxError = error_1.default;
