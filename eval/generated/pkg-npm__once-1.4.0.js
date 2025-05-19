  var called = false;
  var value;
  return function() {
    if (called) return value;
    called = true;
    value = fn.apply(this, arguments);
    fn = null;
    return value;
  };
}
module.exports = once;