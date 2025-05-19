  var core = {};

  var defineProperty = Object.defineProperty;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var arraySlice = Array.prototype.slice;
  var toString = Object.prototype.toString;

  function isCallable(fn) {
    return typeof fn === 'function';
  }

  function toObject(val) {
    if (val === null || val === undefined) throw new TypeError("Can't convert " + val + ' to object');
    return Object(val);
  }

  function create(proto, props) {
    var obj = {};
    if (proto !== null) {
      function Temp() {}
      Temp.prototype = proto;
      obj = new Temp();
    }
    if (props !== undefined) {
      for (var key in props) {
        if (hasOwnProperty.call(props, key)) {
          defineProperty(obj, key, props[key]);
        }
      }
    }
    return obj;
  }

  function assign(target) {
    target = toObject(target);
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      if (source !== null && source !== undefined) {
        for (var key in source) {
          if (hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
    }
    return target;
  }

  function keys(obj) {
    var k = [];
    for (var key in obj) {
      if (hasOwnProperty.call(obj, key)) k.push(key);
    }
    return k;
  }

  function forEach(arr, fn, that) {
    var O = toObject(arr);
    var len = O.length >>> 0;
    for (var i = 0; i < len; i++) {
      if (i in O) fn.call(that, O[i], i, O);
    }
  }

  function map(arr, fn, that) {
    var O = toObject(arr);
    var len = O.length >>> 0;
    var A = new Array(len);
    for (var i = 0; i < len; i++) {
      if (i in O) A[i] = fn.call(that, O[i], i, O);
    }
    return A;
  }

  function filter(arr, fn, that) {
    var O = toObject(arr);
    var len = O.length >>> 0;
    var res = [];
    for (var i = 0; i < len; i++) {
      if (i in O && fn.call(that, O[i], i, O)) res.push(O[i]);
    }
    return res;
  }

  function reduce(arr, fn, val) {
    var O = toObject(arr);
    var len = O.length >>> 0;
    var k = 0, value;
    if (arguments.length >= 3) value = val;
    else {
      while (k < len && !(k in O)) k++;
      if (k >= len) throw new TypeError('Reduce of empty array');
      value = O[k++];
    }
    for (; k < len; k++) {
      if (k in O) value = fn(value, O[k], k, O);
    }
    return value;
  }

  function includes(arr, search, fromIndex) {
    var O = toObject(arr);
    var len = O.length >>> 0;
    if (len === 0) return false;
    var n = fromIndex | 0;
    var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
    while (k < len) {
      if (O[k] === search || (typeof O[k] === 'number' && typeof search === 'number' && isNaN(O[k]) && isNaN(search))) return true;
      k++;
    }
    return false;
  }

  function bind(fn, thisArg) {
    var args = arraySlice.call(arguments, 2);
    return function() {
      return fn.apply(thisArg, args.concat(arraySlice.call(arguments)));
    };
  }

  core.Object = {
    assign: assign,
    create: create,
    keys: keys
  };

  core.Array = {
    forEach: forEach,
    map: map,
    filter: filter,
    reduce: reduce,
    includes: includes
  };

  core.Function = {
    bind: bind
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = core;
  } else {
    global.core = core;
  }
})(this);