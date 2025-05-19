  var root = typeof self == 'object' && self.self === self && self ||
    typeof global == 'object' && global.global === global && global ||
    this;

  var toString = Object.prototype.toString;
  var nativeIsArray = Array.isArray;
  var nativeKeys = Object.keys;

  function isArray(obj) {
    return nativeIsArray ? nativeIsArray(obj) : toString.call(obj) === '[object Array]';
  }

  function isObject(obj) {
    return obj !== null && typeof obj === 'object';
  }

  function isFunction(obj) {
    return typeof obj === 'function' || false;
  }

  function each(obj, iteratee) {
    var i, length;
    if (isArray(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else if (isObject(obj)) {
      var keys = nativeKeys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  }

  function map(obj, iteratee) {
    var results = [];
    if (isArray(obj)) {
      for (var i = 0, length = obj.length; i < length; i++) {
        results.push(iteratee(obj[i], i, obj));
      }
    } else {
      var keys = nativeKeys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        results.push(iteratee(obj[keys[i]], keys[i], obj));
      }
    }
    return results;
  }

  function filter(obj, predicate) {
    var results = [];
    each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  }

  function reduce(obj, iteratee, memo) {
    var initial = arguments.length > 2;
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iteratee(memo, value, index, list);
      }
    });
    return memo;
  }

  function clone(obj) {
    if (!isObject(obj)) return obj;
    return isArray(obj) ? obj.slice() : extend({}, obj);
  }

  function extend(obj) {
    if (!isObject(obj)) return obj;
    for (var i = 1, length = arguments.length; i < length; i++) {
      var source = arguments[i];
      if (source) {
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            obj[key] = source[key];
          }
        }
      }
    }
    return obj;
  }

  function keys(obj) {
    if (!isObject(obj)) return [];
    return nativeKeys(obj);
  }

  var _ = {
    each: each,
    map: map,
    filter: filter,
    reduce: reduce,
    clone: clone,
    extend: extend,
    keys: keys,
    isArray: isArray,
    isObject: isObject,
    isFunction: isFunction
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = _;
  } else {
    root._ = _;
  }
})();