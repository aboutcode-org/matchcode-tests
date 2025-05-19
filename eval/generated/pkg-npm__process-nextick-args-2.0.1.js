
module.exports = nextTick;

function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }
  var len = arguments.length;
  switch (len) {
    case 1:
      process.nextTick(fn);
      break;
    case 2:
      process.nextTick(function() {
        fn.call(null, arg1);
      });
      break;
    case 3:
      process.nextTick(function() {
        fn.call(null, arg1, arg2);
      });
      break;
    case 4:
      process.nextTick(function() {
        fn.call(null, arg1, arg2, arg3);
      });
      break;
    default:
      var args = new Array(len - 1);
      for (var i = 1; i < len; i++) {
        args[i - 1] = arguments[i];
      }
      process.nextTick(function() {
        fn.apply(null, args);
      });
      break;
  }
}