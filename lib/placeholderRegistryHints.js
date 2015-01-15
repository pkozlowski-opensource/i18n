"use strict";

var message_types = require("./message_types");

var getNameHintForHtmlTag = require("./placeholderRegistryHintsForHtmlTags").getNameHintForHtmlTag;

function getNameHintForPlaceholder(placeholder) {
  if (placeholder instanceof message_types.TagPair) {
    var typeName = placeholder.getStableTypeName();
    switch (typeName) {
      case message_types.TYPENAME_HTML_TAG_PAIR:
        return getNameHintForHtmlTag(placeholder.tag);
      default:
        // NOTE: If/When we support different tag types, we want to come up with
        // a sane system of naming the generated placeholders instead of
        // generating one automatically here.  By throwing an error here, we
        // force ourselves to revisit this code and pick a good naming scheme.
        throw Error("InternalError: Placeholder hints for tags of type \"" + typeName + "\" are not yet implemented.");
    }
  } else {
    return placeholder instanceof message_types.NgExpr ? "EXPRESSION" : "PH";
  }
}

module.exports.getNameHintForPlaceholder = getNameHintForPlaceholder;

//# sourceMappingURL=placeholderRegistryHints.js.map