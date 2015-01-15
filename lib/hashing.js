"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/**
 * This is a facade around the minimal hashing interface that we're using for
 * fingerpriting.  We might need to do this from the browser or the command
 * line or entirely change the underlying libraries we would use to do it.
 */

var crypto = require("crypto");

/*
interface Hasher {
  update(data);
  hexdigest();
}
*/

var SHA1 = (function () {
  function SHA1() {
    _classCallCheck(this, SHA1);

    this._shasum = crypto.createHash("sha1");
  }

  _createClass(SHA1, [{
    key: "update",
    value: function update(text /*: string*/) {
      this._shasum.update(text, "utf8");
    }
  }, {
    key: "hexdigest",
    value: function hexdigest() /*: string*/{
      var result = this._shasum.digest("hex");
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