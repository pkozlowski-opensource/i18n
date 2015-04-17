import assert from 'assert';
import parse5 from 'parse5';

var _ADAPTER = parse5.TreeAdapters.default;

exports.adapter = _ADAPTER;

// Returns the root element.
exports.parseHtml = function parseHtml(html) {
  let parser = new parse5.Parser(_ADAPTER);
  let root = parser.parse(html);
  // Normally, "root" is the document node and contains the optional doctype
  // node and the HTML node as children.  We'll skip the doctype node and
  // return the only HTML node.
  let elements = [for (child of _ADAPTER.getChildNodes(root))
                  if (!_ADAPTER.isDocumentTypeNode(child))
                  child];
  if (elements.length != 1) {
    throw Error("Found more than one element at the root level while parsing HTML text");
  }
  return elements[0];
}
