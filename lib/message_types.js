/**
 * Message Types Reference
 *
 * Actual types will be in TypeScript 1.5+.  However, this TypeScript 1.4
 * version is the current official type specification.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/* These fixed strings have to be stable and are intended to be
 * backwards/forwards compatible.  They are used in the computation of the
 * message fingerprint (for message id) and in the JSON serialization of our
 * messages to disk.  The actual classes that uses these typenames are free to
 * change their names or use inheritance/composition/whatever as long as they
 * eventually identify with one of these types.*/
exports.TYPENAME_TEXT_PART = "TextPart";
exports.TYPENAME_TAG_PAIR_BEGIN_REF = "TagPairBegin";
exports.TYPENAME_TAG_PAIR_END_REF = "TagPairEnd";
exports.TYPENAME_HTML_TAG_PAIR = "HtmlTagPair";
exports.TYPENAME_NG_EXPR = "NgExpr";
var TextPart = (function () {
    function TextPart(value) {
        this.value = value;
    }
    // degenerate case.
    TextPart.prototype.toLongFingerprint = function () { return this.value; };
    // NOTE: Do NOT replace the fixed string returned by this function with the
    // expression "typeof this".  This name should be stable across versions to
    // ensure stable message ids (hashing).
    TextPart.prototype.getStableTypeName = function () { return exports.TYPENAME_TEXT_PART; };
    return TextPart;
})();
exports.TextPart = TextPart;
var PlaceholderBase = (function () {
    function PlaceholderBase(name, text, examples, comment) {
        this.name = name;
        this.text = text;
        this.examples = examples;
        this.comment = comment;
    }
    PlaceholderBase.prototype.toLongFingerprint = function () { throw Error("You must use a subclass that overrides this method."); };
    PlaceholderBase.prototype.getStableTypeName = function () { throw Error("You must use a subclass that overrides this method."); };
    return PlaceholderBase;
})();
exports.PlaceholderBase = PlaceholderBase;
var NgExpr = (function (_super) {
    __extends(NgExpr, _super);
    function NgExpr() {
        _super.apply(this, arguments);
    }
    // TODO: toLongFingerprint must calcuate this in a proper way.
    NgExpr.prototype.toLongFingerprint = function () { return exports.TYPENAME_NG_EXPR + this.text; };
    NgExpr.prototype.getStableTypeName = function () { return exports.TYPENAME_NG_EXPR; };
    return NgExpr;
})(PlaceholderBase);
exports.NgExpr = NgExpr;
// TagPairs, when serialized, will use a pair of placeholders to represent
// their begin and end.  TagPairBeginRef and TagPairEndRef represent those placeholders.
var TagPairRefBase = (function () {
    function TagPairRefBase(name, text, examples, comment) {
        this.name = name;
        this.text = text;
        this.examples = examples;
        this.comment = comment;
    }
    // degenerate case.
    TagPairRefBase.prototype.toLongFingerprint = function () { return this.text; };
    TagPairRefBase.prototype.getStableTypeName = function () { throw Error("You must use a subclass that overrides this method."); };
    return TagPairRefBase;
})();
exports.TagPairRefBase = TagPairRefBase;
var TagPairBeginRef = (function (_super) {
    __extends(TagPairBeginRef, _super);
    function TagPairBeginRef() {
        _super.apply(this, arguments);
    }
    // NOTE: Do NOT replace the fixed string returned by this function with the
    // expression "typeof this".  This name should be stable across versions to
    // ensure stable message ids (hashing).
    TagPairBeginRef.prototype.getStableTypeName = function () { return exports.TYPENAME_TAG_PAIR_BEGIN_REF; };
    return TagPairBeginRef;
})(TagPairRefBase);
exports.TagPairBeginRef = TagPairBeginRef;
var TagPairEndRef = (function (_super) {
    __extends(TagPairEndRef, _super);
    function TagPairEndRef() {
        _super.apply(this, arguments);
    }
    // NOTE: Do NOT replace the fixed string returned by this function with the
    // expression "typeof this".  This name should be stable across versions to
    // ensure stable message ids (hashing).
    TagPairEndRef.prototype.getStableTypeName = function () { return exports.TYPENAME_TAG_PAIR_END_REF; };
    return TagPairEndRef;
})(TagPairRefBase);
exports.TagPairEndRef = TagPairEndRef;
var TagPair = (function () {
    function TagPair(
        // tag name: e.g. "span" for the HTML <span> tag.
        tag, 
        // original full begin tag with all attributes, etc. as is.
        begin, 
        // original full end tag.
        end, parts, examples, 
        // canonical_key
        tagFingerprintLong, beginPlaceholderRef, // ph_begin
        endPlaceholderRef // ph_end
        ) {
        this.tag = tag;
        this.begin = begin;
        this.end = end;
        this.parts = parts;
        this.examples = examples;
        this.tagFingerprintLong = tagFingerprintLong;
        this.beginPlaceholderRef = beginPlaceholderRef;
        this.endPlaceholderRef = endPlaceholderRef;
        // Assert that only a subclass that has implemented a proper
        // getStableTypeName() method is beging constructed.
        this.getStableTypeName();
    }
    // degenerate case.
    TagPair.prototype.toLongFingerprint = function () { return this.tagFingerprintLong; };
    TagPair.prototype.getStableTypeName = function () { throw Error("You must use a subclass that overrides this method."); };
    return TagPair;
})();
exports.TagPair = TagPair;
var HtmlTagPair = (function (_super) {
    __extends(HtmlTagPair, _super);
    function HtmlTagPair() {
        _super.apply(this, arguments);
    }
    // degenerate case.
    HtmlTagPair.prototype.toLongFingerprint = function () { return this.tagFingerprintLong; };
    HtmlTagPair.prototype.getStableTypeName = function () { return exports.TYPENAME_HTML_TAG_PAIR; };
    HtmlTagPair.NewForParsing = function (tag, begin, end, parts, examples, tagFingerprintLong) {
        var beginPlaceholderRef = new TagPairBeginRef(
        /* name = */ void 0, 
        /* text = */ begin, 
        /* examples = */ [begin], 
        /* comment = */ "Begin HTML <" + tag + "> tag");
        var endPlaceholderRef = new TagPairEndRef(
        /* name = */ void 0, 
        /* text = */ end, 
        /* examples = */ [end], 
        /* comment = */ "End HTML </" + tag + "> tag");
        return new HtmlTagPair(tag, begin, end, parts, examples, tagFingerprintLong, beginPlaceholderRef, endPlaceholderRef);
    };
    return HtmlTagPair;
})(TagPair);
exports.HtmlTagPair = HtmlTagPair;
var Message = (function () {
    function Message(id, meaning, comment, /* CKCK: new */ parts, placeholdersMap) {
        this.id = id;
        this.meaning = meaning;
        this.comment = comment;
        this.parts = parts;
        this.placeholdersMap = placeholdersMap;
    }
    return Message;
})();
exports.Message = Message;
// Support importing from babeljs transpiled files.
exports.__esModule = true;
//# sourceMappingURL=message_types.js.map