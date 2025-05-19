var hasOwn = Object.prototype.hasOwnProperty;
function isObject(val) {
  return val !== null && typeof val === 'object';
}
function extend() {
  var options, name, src, copy, copyIsArray, clone;
  var target = arguments[0] || {};
  var i = 1;
  var length = arguments.length;
  var deep = false;
  if (typeof target === 'boolean') {
    deep = target;
    target = arguments[1] || {};
    i = 2;
  }
  if (typeof target !== 'object' && typeof target !== 'function') {
    target = {};
  }
  for (; i < length; i++) {
    if ((options = arguments[i]) != null) {
      for (name in options) {
        if (hasOwn.call(options, name)) {
          src = target[name];
          copy = options[name];
          if (target === copy) {
            continue;
          }
          if (deep && copy && (isObject(copy) || (copyIsArray = Array.isArray(copy)))) {
            if (copyIsArray) {
              copyIsArray = false;
              clone = src && Array.isArray(src) ? src : [];
            } else {
              clone = src && isObject(src) ? src : {};
            }
            target[name] = extend(deep, clone, copy);
          } else if (copy !== undefined) {
            target[name] = copy;
          }
        }
      }
    }
  }
  return target;
}
module.exports = extend;