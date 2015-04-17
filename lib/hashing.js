/**
 * This is a facade around the minimal hashing interface that we're using for
 * fingerpriting.  We might need to do this from the browser or the command
 * line or entirely change the underlying libraries we would use to do it.
 */

'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

var _crypto = require('crypto');

var _crypto2 = _interopRequireWildcard(_crypto);

/*
interface Hasher {
  update(data);
  hexdigest();
}
*/

var SHA1 = (function () {
  function SHA1() {
    _classCallCheck(this, SHA1);

    this._shasum = _crypto2['default'].createHash('sha1');
  }

  _createClass(SHA1, [{
    key: 'update',
    value: function update(text /*: string*/) {
      this._shasum.update(text, 'utf8');
    }
  }, {
    key: 'hexdigest',
    value: function hexdigest() /*: string*/{
      var result = this._shasum.digest('hex');
      // destroy underlying object so that we can't call update() anymore.
      this._shasum = null;
      return result;
    }
  }]);

  return SHA1;
})();

exports.SHA1 = SHA1;
/* implements Hasher */

//# sourceMappingURL=hashing.js.map