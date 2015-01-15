var TextPart = (function () {
    function TextPart(value) {
        this.value = value;
    }
    // degenerate case.
    TextPart.prototype.toLongFingerprint = function () {
        return this.value;
    };
    TextPart.prototype.getStableTypeName = function () {
        return "TextPart";
    };
    return TextPart;
})();
