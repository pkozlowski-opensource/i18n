"use strict";

var _core = require("babel-runtime/core-js")["default"];

var _regeneratorRuntime = require("babel-runtime/regenerator")["default"];

var _genIdParts = _regeneratorRuntime.mark(function _genIdParts(msgBuilder) {
  var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, i;

  return _regeneratorRuntime.wrap(function _genIdParts$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _escapeTextForMessageId(msgBuilder.meaning || "");

      case 2:
        _iteratorNormalCompletion2 = true;
        _didIteratorError2 = false;
        _iteratorError2 = undefined;
        context$1$0.prev = 5;
        _iterator2 = _core.getIterator(_genIdPartsForSubparts(msgBuilder.parts));

      case 7:
        if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
          context$1$0.next = 14;
          break;
        }

        i = _step2.value;
        context$1$0.next = 11;
        return i;

      case 11:
        _iteratorNormalCompletion2 = true;
        context$1$0.next = 7;
        break;

      case 14:
        context$1$0.next = 20;
        break;

      case 16:
        context$1$0.prev = 16;
        context$1$0.t0 = context$1$0["catch"](5);
        _didIteratorError2 = true;
        _iteratorError2 = context$1$0.t0;

      case 20:
        context$1$0.prev = 20;
        context$1$0.prev = 21;

        if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
          _iterator2["return"]();
        }

      case 23:
        context$1$0.prev = 23;

        if (!_didIteratorError2) {
          context$1$0.next = 26;
          break;
        }

        throw _iteratorError2;

      case 26:
        return context$1$0.finish(23);

      case 27:
        return context$1$0.finish(20);

      case 28:
      case "end":
        return context$1$0.stop();
    }
  }, _genIdParts, this, [[5, 16, 20, 28], [21,, 23, 27]]);
});

var _genIdPartsForSubparts = _regeneratorRuntime.mark(function _genIdPartsForSubparts(parts) {
  var placeholders, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, part, i, placeholderNames, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, _name, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, _name2, placeholder;

  return _regeneratorRuntime.wrap(function _genIdPartsForSubparts$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        placeholders = new _core.Map();
        _iteratorNormalCompletion3 = true;
        _didIteratorError3 = false;
        _iteratorError3 = undefined;
        context$1$0.prev = 4;
        _iterator3 = _core.getIterator(parts);

      case 6:
        if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
          context$1$0.next = 38;
          break;
        }

        part = _step3.value;

        if (!(typeof part === "string")) {
          context$1$0.next = 13;
          break;
        }

        context$1$0.next = 11;
        return "" + BEGIN_TEXT + "" + _escapeTextForMessageId(part) + "" + ESCAPE_END;

      case 11:
        context$1$0.next = 35;
        break;

      case 13:
        if (!(part instanceof message_types.TextPart)) {
          context$1$0.next = 18;
          break;
        }

        context$1$0.next = 16;
        return "" + BEGIN_TEXT + "" + _escapeTextForMessageId(part.value) + "" + ESCAPE_END;

      case 16:
        context$1$0.next = 35;
        break;

      case 18:
        if (!(part instanceof message_types.PlaceholderBase)) {
          context$1$0.next = 22;
          break;
        }

        placeholders.set(part.name, part);
        context$1$0.next = 35;
        break;

      case 22:
        if (!(part instanceof message_types.TagPair)) {
          context$1$0.next = 34;
          break;
        }

        context$1$0.next = 25;
        return "" + BEGIN_TAG + "" + part.beginPlaceholderRef.name + "," + part.getStableTypeName() + "" + ESCAPE_END;

      case 25:
        context$1$0.t1 = _regeneratorRuntime.keys(_genIdPartsForSubparts(part.parts));

      case 26:
        if ((context$1$0.t2 = context$1$0.t1()).done) {
          context$1$0.next = 32;
          break;
        }

        i = context$1$0.t2.value;
        context$1$0.next = 30;
        return i;

      case 30:
        context$1$0.next = 26;
        break;

      case 32:
        context$1$0.next = 35;
        break;

      case 34:
        throw Error("Encountered unknown message part type while computing message ID: " + part.getStableTypeName());

      case 35:
        _iteratorNormalCompletion3 = true;
        context$1$0.next = 6;
        break;

      case 38:
        context$1$0.next = 44;
        break;

      case 40:
        context$1$0.prev = 40;
        context$1$0.t3 = context$1$0["catch"](4);
        _didIteratorError3 = true;
        _iteratorError3 = context$1$0.t3;

      case 44:
        context$1$0.prev = 44;
        context$1$0.prev = 45;

        if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
          _iterator3["return"]();
        }

      case 47:
        context$1$0.prev = 47;

        if (!_didIteratorError3) {
          context$1$0.next = 50;
          break;
        }

        throw _iteratorError3;

      case 50:
        return context$1$0.finish(47);

      case 51:
        return context$1$0.finish(44);

      case 52:
        placeholderNames = [];
        _iteratorNormalCompletion4 = true;
        _didIteratorError4 = false;
        _iteratorError4 = undefined;
        context$1$0.prev = 56;

        for (_iterator4 = _core.getIterator(placeholders.keys()); !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          _name = _step4.value;

          placeholderNames.push(_name);
        }
        context$1$0.next = 64;
        break;

      case 60:
        context$1$0.prev = 60;
        context$1$0.t4 = context$1$0["catch"](56);
        _didIteratorError4 = true;
        _iteratorError4 = context$1$0.t4;

      case 64:
        context$1$0.prev = 64;
        context$1$0.prev = 65;

        if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
          _iterator4["return"]();
        }

      case 67:
        context$1$0.prev = 67;

        if (!_didIteratorError4) {
          context$1$0.next = 70;
          break;
        }

        throw _iteratorError4;

      case 70:
        return context$1$0.finish(67);

      case 71:
        return context$1$0.finish(64);

      case 72:
        placeholderNames.sort();
        _iteratorNormalCompletion5 = true;
        _didIteratorError5 = false;
        _iteratorError5 = undefined;
        context$1$0.prev = 76;
        _iterator5 = _core.getIterator(placeholderNames);

      case 78:
        if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
          context$1$0.next = 86;
          break;
        }

        _name2 = _step5.value;
        placeholder = placeholders.get(_name2);
        context$1$0.next = 83;
        return "{BEGIN_PH}{name},{placeholder.getStableTypeName()}{ESCAPE_END}";

      case 83:
        _iteratorNormalCompletion5 = true;
        context$1$0.next = 78;
        break;

      case 86:
        context$1$0.next = 92;
        break;

      case 88:
        context$1$0.prev = 88;
        context$1$0.t5 = context$1$0["catch"](76);
        _didIteratorError5 = true;
        _iteratorError5 = context$1$0.t5;

      case 92:
        context$1$0.prev = 92;
        context$1$0.prev = 93;

        if (!_iteratorNormalCompletion5 && _iterator5["return"]) {
          _iterator5["return"]();
        }

      case 95:
        context$1$0.prev = 95;

        if (!_didIteratorError5) {
          context$1$0.next = 98;
          break;
        }

        throw _iteratorError5;

      case 98:
        return context$1$0.finish(95);

      case 99:
        return context$1$0.finish(92);

      case 100:
      case "end":
        return context$1$0.stop();
    }
  }, _genIdPartsForSubparts, this, [[4, 40, 44, 52], [45,, 47, 51], [56, 60, 64, 72], [65,, 67, 71], [76, 88, 92, 100], [93,, 95, 99]]);
});

var assert = require("assert"),
    message_types = require("./message_types.js"),
    hashing = require("./hashing"),
    S = require("string");

// Escape sequences for fingerprinting.
// Fingerprinting requires unique digests for unique messages.  The approach is
// to construct a unique long string for unique messages and use a fixed and
// good fingerprinting algorithm to get a smaller digest out of it (64/128 bits
// should be sufficient.)  These escape sequences are used in generating the
// unique long string per message.
var ESCAPE_CHAR = "\u0010";
var ESCAPE_CHAR_RE = new RegExp(ESCAPE_CHAR, "g");
var ESCAPE_END = ESCAPE_CHAR + ".";
var BEGIN_TEXT = ESCAPE_CHAR + "'";
var BEGIN_PH = ESCAPE_CHAR + "X";
var BEGIN_TAG = ESCAPE_CHAR + "<";
var END_TAG = ESCAPE_CHAR + ">";

function _escapeTextForMessageId(text) {
  return text.replace(ESCAPE_CHAR_RE, ESCAPE_CHAR + ESCAPE_CHAR);
}

function computeIdForMessageBuilder(msgBuilder) {
  var hasher = new hashing.SHA1();
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = _core.getIterator(_genIdParts(msgBuilder)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var part = _step.value;

      hasher.update(part);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"]) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return hasher.hexdigest();
}

exports.computeIdForMessageBuilder = computeIdForMessageBuilder;

//# sourceMappingURL=fingerprinting.js.map