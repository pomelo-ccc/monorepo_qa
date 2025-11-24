'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.isEmail = exports.formatDate = void 0;
const formatDate = (date) => {
  return date.toISOString();
};
exports.formatDate = formatDate;
const isEmail = (email) => {
  return email.includes('@');
};
exports.isEmail = isEmail;
//# sourceMappingURL=index.js.map
