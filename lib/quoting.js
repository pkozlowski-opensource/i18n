'use strict';

var _core = require('babel-runtime/core-js')['default'];

_core.Object.defineProperty(exports, '__esModule', {
  value: true
});

exports.quoteHtmlAttribute = quoteHtmlAttribute;

var _quoteString = require('./stringUtils');

function escapeHtmlAttributePart(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function quoteHtmlAttribute(value) {
  return _quoteString.quoteString(escapeHtmlAttributePart(value), '&quot;');
}

//# sourceMappingURL=quoting.js.map