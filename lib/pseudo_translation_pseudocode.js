"use strict;"

var logging = require('logging');
logger = logging.getLogger(__name__);
var itertools = require('itertools');
var lxml.html = require('lxml.html');
var re = require('re');

// class Error extends Exception;
function Error() {
}

Error.prototype = Object.create(Exception.prototype);
UMLAUT = '\u0308';

function _pseudo_translate_word(word) {
  accented_word = ''.join((((33 <= ord(c) <= 126) ? (c + UMLAUT) : c) for c in word));
  return ((word + ' ') + accented_word);
}

function _pseudo_translate_text(text) {
  return re.sub('\\w+', (function(m) { return _pseudo_translate_word(m.group()); }), text);
}

function _pseudo_translate_part(part) {
  if (isinstance(part, str)) {
    return _pseudo_translate_text(part);
  } else if (isinstance(part, message.Placeholder)) {
    return part;
  } else if (isinstance(part, message.TagPair)) {
    part.parts = list(map(_pseudo_translate_part, part.parts));
    return part;
  } else {
    throw Error('Unexpected condition');
  }
}

function pseudo_translate(msg) {
  msg.parts = list(map(_pseudo_translate_part, msg.parts));
  return msg;
}
