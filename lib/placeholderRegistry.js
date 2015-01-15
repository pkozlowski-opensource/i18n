"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var LoadingCache = require("./LoadingCache").LoadingCache,
    Counter = require("./Counter").Counter,
    message_types = require("./message_types"),
    hints = require("./placeholderRegistryHints");

if (true + true !== 2 || false + false !== 0) {
  throw Error("Internal Error: Please file an issue on GitHub with this stacktrace.");
}

function toBool(x) {
  return x ? true : false;
}

var PlaceholderRegistry = (function () {
  function PlaceholderRegistry() {
    _classCallCheck(this, PlaceholderRegistry);

    this._namesSeen = new Set();
    // We require an ordered Map.  ES6 Map's iterate in insertion order (Map.forEach)
    // so we can simply use Map.
    // Refer section 23.1.3.5 of the draft spec.
    // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-map.prototype.foreach
    this._byFingerprint = new Map();
    this._countsByPrefix = new LoadingCache(function (key) {
      return new Counter(1);
    });
    this._counter = new Counter(1);
  }

  _createClass(PlaceholderRegistry, [{
    key: "toMap",
    value: function toMap() {
      var self = this;
      this._byFingerprint.forEach(function (placeholderOrTag) {
        return self._ensureName(placeholderOrTag);
      });
      var result = new Map();
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this._byFingerprint.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var placeholderOrTag = _step.value;

          if (placeholderOrTag instanceof message_types.PlaceholderBase) {
            result.set(placeholderOrTag.name, placeholderOrTag);
          } else if (placeholderOrTag instanceof message_types.TagPair) {
            var tag_pair = placeholderOrTag;
            result.set(tag_pair.beginPlaceholderRef.name, tag_pair.beginPlaceholderRef);
            result.set(tag_pair.endPlaceholderRef.name, tag_pair.endPlaceholderRef);
          } else {
            throw Error("Internal Error");
          }
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

      return result;
    }
  }, {
    key: "_ensureNamesForTag",
    value: function _ensureNamesForTag(placeholder) {
      if (placeholder.beginPlaceholderRef.name) {
        return;
      }
      var nameHint = hints.getNameHintForPlaceholder(placeholder);
      var beginBasename = nameHint + "_BEGIN",
          endBasename = nameHint + "_END",
          phBeginName = beginBasename,
          phEndName = endBasename,
          counter = this._countsByPrefix.get(beginBasename);
      while (this._namesSeen.has(phBeginName) || this._namesSeen.has(phEndName)) {
        var count = counter.next();
        phBeginName = "" + beginBasename + "_" + count;
        phEndName = "" + endBasename + "_" + count;
      }
      this._namesSeen.add(phBeginName);
      this._namesSeen.add(phEndName);
      placeholder.beginPlaceholderRef.name = phBeginName;
      placeholder.endPlaceholderRef.name = phEndName;
    }
  }, {
    key: "ensureNameForPlaceholder",
    value: function ensureNameForPlaceholder(placeholder) {
      if (placeholder.name) {
        return;
      }
      var basename = hints.getNameHintForPlaceholder(placeholder),
          name = basename;
      var counter = this._countsByPrefix.get(basename);
      while (this._namesSeen.has(name)) {
        name = "" + basename + "_" + counter.next();
      }
      this._namesSeen.add(name);
      placeholder.name = name;
    }
  }, {
    key: "_ensureName",
    value: function _ensureName(placeholder) {
      if (placeholder instanceof message_types.TagPair) {
        this._ensureNamesForTag(placeholder);
      } else {
        this.ensureNameForPlaceholder(placeholder);
      }
    }
  }, {
    key: "reserveNewTag",
    value: function reserveNewTag(tagName) {
      var canonicalKey = "TAG_" + tagName + "_" + this._counter.next();
      this._byFingerprint.set(canonicalKey, null);
      return canonicalKey;
    }
  }, {
    key: "updatePlaceholder",
    value: function updatePlaceholder(placeholder) {
      if (placeholder instanceof message_types.TagPair) {
        return this._updateTagPlaceholder(placeholder);
      } else {
        return this._updateSimplePlaceholder(placeholder);
      }
    }
  }, {
    key: "_updateTagPlaceholder",
    value: function _updateTagPlaceholder(placeholder) {
      var canonicalKey = placeholder.toLongFingerprint();
      this._byFingerprint.set(canonicalKey, placeholder);
      return placeholder;
    }
  }, {
    key: "_updateSimplePlaceholder",
    value: function _updateSimplePlaceholder(placeholder) {
      var canonicalKey = placeholder.toLongFingerprint();
      var existingPlaceholder = this._byFingerprint.get(canonicalKey);
      if (existingPlaceholder !== void 0) {
        var numNames = toBool(placeholder.name) + toBool(existingPlaceholder.name);
        if (numNames === 2) {
          if (placeholder.name != existingPlaceholder.name) {
            throw Error("The same placeholder occurs more than once with a different placeholder name.");
          }
        } else if (numNames == 1) {
          if (placeholder.name == null) {
            placeholder.name = existingPlaceholder.name;
          } else {
            existingPlaceholder.name = placeholder.name;
          }
        }
      } else {
        this._byFingerprint.set(canonicalKey, placeholder);
      }
      return placeholder;
    }
  }]);

  return PlaceholderRegistry;
})();

module.exports = PlaceholderRegistry;

//# sourceMappingURL=placeholderRegistry.js.map