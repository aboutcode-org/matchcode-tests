function assign(target) {
  if (target == null) {
    throw new TypeError('Cannot convert undefined or null to object');
  }
  var to = Object(target);
  for (var i = 1; i < arguments.length; i++) {
    var nextSource = arguments[i];
    if (nextSource != null) {
      for (var key in nextSource) {
        if (Object.prototype.hasOwnProperty.call(nextSource, key)) {
          to[key] = nextSource[key];
        }
      }
    }
  }
  return to;
}