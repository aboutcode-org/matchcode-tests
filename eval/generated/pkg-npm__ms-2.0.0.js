  str = String(str);
  if (str.length > 10000) return;
  var match = /^(-?(?:\d+)?\.?\d+) *([a-zµμ]*)$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years': case 'year': case 'yrs': case 'yr': case 'y':
      return n * 31557600000;
    case 'weeks': case 'week': case 'w':
      return n * 604800000;
    case 'days': case 'day': case 'd':
      return n * 86400000;
    case 'hours': case 'hour': case 'hrs': case 'hr': case 'h':
      return n * 3600000;
    case 'minutes': case 'minute': case 'mins': case 'min': case 'm':
      return n * 60000;
    case 'seconds': case 'second': case 'secs': case 'sec': case 's':
      return n * 1000;
    case 'milliseconds': case 'millisecond': case 'msecs': case 'msec': case 'ms': case 'µs': case 'μs':
      return n;
    default:
      return;
  }
}

function fmtShort(ms) {
  var absMs = Math.abs(ms);
  if (absMs >= 31557600000) return Math.round(ms / 31557600000) + 'y';
  if (absMs >= 604800000) return Math.round(ms / 604800000) + 'w';
  if (absMs >= 86400000) return Math.round(ms / 86400000) + 'd';
  if (absMs >= 3600000) return Math.round(ms / 3600000) + 'h';
  if (absMs >= 60000) return Math.round(ms / 60000) + 'm';
  if (absMs >= 1000) return Math.round(ms / 1000) + 's';
  return ms + 'ms';
}

function fmtLong(ms) {
  var absMs = Math.abs(ms);
  if (absMs >= 31557600000) return plural(ms, 31557600000, 'year');
  if (absMs >= 604800000) return plural(ms, 604800000, 'week');
  if (absMs >= 86400000) return plural(ms, 86400000, 'day');
  if (absMs >= 3600000) return plural(ms, 3600000, 'hour');
  if (absMs >= 60000) return plural(ms, 60000, 'minute');
  if (absMs >= 1000) return plural(ms, 1000, 'second');
  return ms + ' ms';
}

function plural(ms, n, name) {
  var val = Math.round(ms / n);
  return val + ' ' + name + (val === 1 ? '' : 's');
}

function ms(val, opts) {
  opts = opts || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isFinite(val)) {
    return opts.long ? fmtLong(val) : fmtShort(val);
  }
  return;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ms;
}