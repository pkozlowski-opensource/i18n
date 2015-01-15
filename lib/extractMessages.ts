declare function require(name:string);

require('source-map-support').install();

var ckckStringify = require('./../ckckStringify');

import {loadAppConfig} from './config';
import {Message} from './message_types';

var assert = require("assert"),
    fs = require("fs"),
    parseHtml = require("./parse_html").parseHtml,
    parseMessages = require("./parse_messages").parseMessages;

function main() {
  var config = loadAppConfig();
  for (let src of config.htmlSrcs) {
    var html:string = fs.readFileSync(src, {encoding: "utf-8"});
    // assertValidHtml(html);
    var rootNode = parseHtml(html);
    var messages:Map<string, Message> = parseMessages(rootNode);
    console.log(ckckStringify(messages));
    // writeMessagesToJson(messages);

    // todo: compare with previous extraction?
    // todo: what's the database?  where is it?
    // todo: the same message can be found in multiple source files
    // todo: what src file should be associated with the message?
  }
}

main();
