import {LoadingCache} from './LoadingCache';
import {Counter} from './Counter';
import * as M from './message_types';
import * as hints from './placeholderRegistryHints';

if ((true + true !== 2) || (false + false) !== 0) {
  throw Error("Internal Error: Please file an issue on GitHub with this stacktrace.");
}

function toBool(x) {
  return x ? true : false;
}

class PlaceholderRegistry {
  constructor() {
    this._namesSeen = new Set();
    // We require an ordered Map.  ES6 Map's iterate in insertion order (Map.forEach)
    // so we can simply use Map.
    // Refer section 23.1.3.5 of the draft spec.
    // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-map.prototype.foreach
    this._byFingerprint = new Map();
    this._countsByPrefix = new LoadingCache(key => new Counter(1));
    this._counter = new Counter(1);
  }

  toMap() {
    var self = this;
    this._byFingerprint.forEach(placeholderOrTag => self._ensureName(placeholderOrTag));
    var result = new Map();
    for (let placeholderOrTag of this._byFingerprint.values()) {
      if (placeholderOrTag instanceof M.PlaceholderBase) {
        result.set(placeholderOrTag.name, placeholderOrTag);
      } else if (placeholderOrTag instanceof M.TagPair) {
        var tag_pair = placeholderOrTag;
        result.set(tag_pair.beginPlaceholderRef.name, tag_pair.beginPlaceholderRef);
        result.set(tag_pair.endPlaceholderRef.name, tag_pair.endPlaceholderRef);
      } else {
        throw Error('Internal Error');
      }
    }
    return result;
  }

  _ensureNamesForTag(placeholder) {
    if (placeholder.beginPlaceholderRef.name) {
      return;
    }
    var nameHint = hints.getNameHintForPlaceholder(placeholder);
    var beginBasename = nameHint + '_BEGIN',
        endBasename   = nameHint + '_END',
        phBeginName   = beginBasename,
        phEndName     = endBasename,
        counter       = this._countsByPrefix.get(beginBasename);
    while (this._namesSeen.has(phBeginName) || this._namesSeen.has(phEndName)) {
      var count = counter.next();
      phBeginName = `${beginBasename}_${count}`;
      phEndName = `${endBasename}_${count}`;
    }
    this._namesSeen.add(phBeginName);
    this._namesSeen.add(phEndName);
    placeholder.beginPlaceholderRef.name = phBeginName;
    placeholder.endPlaceholderRef.name = phEndName;
  }

  ensureNameForPlaceholder(placeholder) {
    if (placeholder.name) {
      return;
    }
    var basename = hints.getNameHintForPlaceholder(placeholder),
        name     = basename;
    var counter = this._countsByPrefix.get(basename);
    while (this._namesSeen.has(name)) {
      name = `${basename}_${counter.next()}`;
    }
    this._namesSeen.add(name);
    placeholder.name = name;
  }

  _ensureName(placeholder) {
    if (placeholder instanceof M.TagPair) {
      this._ensureNamesForTag(placeholder);
    } else {
      this.ensureNameForPlaceholder(placeholder);
    }
  }

  reserveNewTag(tagName) {
    var canonicalKey = `TAG_${tagName}_${this._counter.next()}`;
    this._byFingerprint.set(canonicalKey, null);
    return canonicalKey;
  }

  updatePlaceholder(placeholder) {
    if (placeholder instanceof M.TagPair) {
      return this._updateTagPlaceholder(placeholder);
    } else {
      return this._updateSimplePlaceholder(placeholder);
    }
  }

  _updateTagPlaceholder(placeholder) {
    var canonicalKey = placeholder.toLongFingerprint();
    this._byFingerprint.set(canonicalKey, placeholder);
    return placeholder;
  }

  _updateSimplePlaceholder(placeholder) {
    var canonicalKey = placeholder.toLongFingerprint();
    var existingPlaceholder = this._byFingerprint.get(canonicalKey);
    if (existingPlaceholder !== void 0) {
      var numNames = toBool(placeholder.name) + toBool(existingPlaceholder.name);
      if (numNames === 2) {
        if (placeholder.name != existingPlaceholder.name) {
          throw Error('The same placeholder occurs more than once with a different placeholder name.');
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
}

module.exports = PlaceholderRegistry;
