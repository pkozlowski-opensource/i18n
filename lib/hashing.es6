/**
 * This is a facade around the minimal hashing interface that we're using for
 * fingerpriting.  We might need to do this from the browser or the command
 * line or entirely change the underlying libraries we would use to do it.
 */

import crypto from 'crypto';

/*
interface Hasher {
  update(data);
  hexdigest();
}
*/

class SHA1 /* implements Hasher */ {
  constructor() {
    this._shasum = crypto.createHash('sha1');
  }

  update(text/*: string*/) {
    this._shasum.update(text, 'utf8');
  }

  hexdigest()/*: string*/ {
    var result = this._shasum.digest('hex');
    // destroy underlying object so that we can't call update() anymore.
    this._shasum = null;
    return result;
  }
}

exports.SHA1 = SHA1;
