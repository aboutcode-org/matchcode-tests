function equal(a, b) {
  if (a === b) return true;
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    if (a.constructor !== b.constructor) return false;
    var i, length, keys;
    if (Array.isArray(a)) {
      length = a.length;
      if (length !== b.length) return false;
      for (i = 0; i < length; i++) {
        if (!equal(a[i], b[i])) return false;
      }
      return true;
    }
    if (a instanceof RegExp) return a.source === b.source && a.flags === b.flags;
    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;
    for (i = 0; i < length; i++) {
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
    }
    for (i = 0; i < length; i++) {
      if (!equal(a[keys[i]], b[keys[i]])) return false;
    }
    return true;
  }
  return a !== a && b !== b;
}
module.exports = equal;