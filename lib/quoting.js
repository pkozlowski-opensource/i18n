'use strict';

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

var _stringUtils = require('./stringUtils');

var _stringUtils2 = _interopRequireWildcard(_stringUtils);

function escapeHtmlAttributePart(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function quoteHtmlAttribute(value) {
  return _stringUtils2['default'].quoteString(escapeHtmlAttributePart(value), '&quot;');
}

exports.quoteHtmlAttribute = quoteHtmlAttribute;

//# sourceMappingURL=quoting.js.map