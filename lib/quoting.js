"use strict";

var stringUtils = require("./stringUtils");

function escapeHtmlAttributePart(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function quoteHtmlAttribute(value) {
  return stringUtils.quoteString(escapeHtmlAttributePart(value), "&quot;");
}

exports.quoteHtmlAttribute = quoteHtmlAttribute;

//# sourceMappingURL=quoting.js.map