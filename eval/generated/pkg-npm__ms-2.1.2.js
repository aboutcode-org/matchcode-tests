var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

function ms(val) {
  if (typeof val === 'string' && val.length > 0) {
    return parse(val);
  } else if (typeof val === 'number' && isFinite(val)) {
    return val;
  }
  return NaN;
}

ms.parse = parse;

ms.format = function(num, opts) {
  opts = opts || {};
  var long = opts.long;
  var abs = Math.abs(num);
  if (abs >= d) {
    return Math.round(num / d) + (long ? ' days' : 'd');
  }
  if (abs >= h) {
    return Math.round(num / h) + (long ? ' hours' : 'h');
  }
  if (abs >= m) {
    return Math.round(num / m) + (long ? ' minutes' : 'm');
  }
  if (abs >= s) {
    return Math.round(num / s) + (long ? ' seconds' : 's');
  }
  return num + (long ? ' ms' : 'ms');
};

function parse(str) {
  str = String(str);
  var match = /^(-?\d+(?:\.\d+)?)([a-zµμ]*)$/i.exec(str.trim());
  if (!match) return NaN;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'y':
    case 'yr':
    case 'yrs':
    case 'year':
    case 'years':
      return n * y;
    case 'w':
    case 'week':
    case 'weeks':
      return n * w;
    case 'd':
    case 'day':
    case 'days':
      return n * d;
    case 'h':
    case 'hr':
    case 'hrs':
    case 'hour':
    case 'hours':
      return n * h;
    case 'm':
    case 'min':
    case 'mins':
    case 'minute':
    case 'minutes':
      return n * m;
    case 's':
    case 'sec':
    case 'secs':
    case 'second':
    case 'seconds':
      return n * s;
    case 'ms':
    case 'msec':
    case 'msecs':
    case 'millisecond':
    case 'milliseconds':
      return n;
    case 'µs':
    case 'μs':
    case 'us':
    case 'microsecond':
    case 'microseconds':
      return n / 1000;
    case 'ns':
    case 'nanosecond':
    case 'nanoseconds':
      return n / 1e6;
    default:
      return NaN;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ms;
}