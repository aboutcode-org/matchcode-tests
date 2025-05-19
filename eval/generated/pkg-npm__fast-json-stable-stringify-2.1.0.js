
function stringify(obj, replacer, spacer) {
  var seen = [];
  return (function _stringify(obj) {
    if (obj && typeof obj.toJSON === 'function') {
      obj = obj.toJSON();
    }
    if (obj === undefined) {
      return;
    }
    if (typeof replacer === 'function') {
      obj = replacer('', obj);
    }
    var type = typeof obj;
    if (obj === null) return 'null';
    if (type === 'number') {
      if (isNaN(obj) || !isFinite(obj)) return 'null';
      return String(obj);
    }
    if (type === 'boolean') return obj ? 'true' : 'false';
    if (type === 'string') return JSON.stringify(obj);
    if (Array.isArray(obj)) {
      if (seen.indexOf(obj) !== -1) throw new TypeError();
      seen.push(obj);
      var res = [];
      for (var i = 0; i < obj.length; i++) {
        var item = _stringify(obj[i]);
        res.push(item === undefined ? 'null' : item);
      }
      seen.pop();
      return '[' + res.join(',') + ']';
    }
    if (type === 'object') {
      if (seen.indexOf(obj) !== -1) throw new TypeError();
      seen.push(obj);
      var keys = Object.keys(obj).sort();
      var items = [];
      for (var j = 0; j < keys.length; j++) {
        var k = keys[j];
        var v = _stringify(obj[k]);
        if (v !== undefined) {
          items.push(JSON.stringify(k) + ':' + v);
        }
      }
      seen.pop();
      return '{' + items.join(',') + '}';
    }
    return;
  })(obj);
}

module.exports = stringify;