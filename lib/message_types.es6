/**
 * This is our canonical implementation of the message types as defined in our official specification (message_types.ts)
 */

/* These fixed strings have to be stable and are intended to be
 * backwards/forwards compatible.  They are used in the computation of the
 * message fingerprint (for message id) and in the JSON serialization of our
 * messages to disk.  The actual classes that uses these typenames are free to
 * change their names or use inheritance/composition/whatever as long as they
 * eventually identify with one of these types.*/
var TYPENAME_TEXT_PART = "TextPart";
var TYPENAME_TAG_PAIR_BEGIN_REF = "TagPairBegin";
var TYPENAME_TAG_PAIR_END_REF = "TagPairEnd";
var TYPENAME_HTML_TAG_PAIR = "HtmlTagPair";


class TextPart {
  constructor(private value);
  getStableTypeName() {
    return TYPENAME_TEXT_PART;
  }
  toLongFingerprint() {
    return this.value;
  }
}


class Placeholder {
  constructor(private value);
}


class TagPairRefBase {
}



