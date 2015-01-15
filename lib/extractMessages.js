require('source-map-support').install();
var ckckStringify = require('./../ckckStringify');
var config_1 = require('./config');
var assert = require("assert"), fs = require("fs"), parseHtml = require("./parse_html").parseHtml, parseMessages = require("./parse_messages").parseMessages;
function main() {
    var config = config_1.loadAppConfig();
    for (var _i = 0, _a = config.htmlSrcs; _i < _a.length; _i++) {
        var src = _a[_i];
        var html = fs.readFileSync(src, { encoding: "utf-8" });
        // assertValidHtml(html);
        var rootNode = parseHtml(html);
        var messages = parseMessages(rootNode);
        console.log(ckckStringify(messages));
    }
}
main();
//# sourceMappingURL=extractMessages.js.map