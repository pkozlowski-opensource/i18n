"use strict";

var _toString = Object.prototype.toString;


function _stringifyCompact(obj) {
  if (typeof obj === 'string') {
    return obj;
  }
  return JSON.stringify(obj);
}


function _mapToReplacementObject(obj) {
  var result = Object.create(null);
  obj.forEach(function (value, key) {
    result[_stringifyCompact(key)] = value;
  });
  return result;
}

function _objToReplacement(obj) {
  if (obj instanceof Map) {
    return _mapToReplacementObject(obj);
  }
  return obj;
}


function jsonStringifier(key, obj) {
  return _objToReplacement(obj);
  // if (key == "") {
  //   return _objToReplacement(obj);
  // }
  // if (obj == null) return undefined;
  // return obj;
}


function stringify(obj) {
  return JSON.stringify(obj, jsonStringifier, 2);
}


module.exports = stringify;
