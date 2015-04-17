'use strict';

var _core = require('babel-runtime/core-js')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

_core.Object.defineProperty(exports, '__esModule', {
  value: true
});

exports.quoteHtmlAttribute = quoteHtmlAttribute;

var _import = require('./stringUtils');

var stringUtils = _interopRequireWildcard(_import);

function escapeHtmlAttributePart(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function quoteHtmlAttribute(value) {
  return stringUtils.quoteString(escapeHtmlAttributePart(value), '&quot;');
}

//# sourceMappingURL=quoting.js.map