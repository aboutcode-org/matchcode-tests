  var maxInt = 2147483647;
  var base = 36;
  var tMin = 1;
  var tMax = 26;
  var skew = 38;
  var damp = 700;
  var initialBias = 72;
  var initialN = 128;
  var delimiter = '-';
  var regexPunycode = /^xn--/;
  var regexNonASCII = /[^\0-\x7E]/;
  var regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g;

  function error(type) {
    throw new RangeError(type);
  }

  function map(array, fn) {
    var result = [];
    var length = array.length;
    for (var i = 0; i < length; i++) {
      result[i] = fn(array[i]);
    }
    return result;
  }

  function mapDomain(string, fn) {
    var array = string.split(regexSeparators);
    return map(array, fn).join('.');
  }

  function ucs2decode(string) {
    var output = [];
    var counter = 0;
    var length = string.length;
    var value, extra;
    while (counter < length) {
      value = string.charCodeAt(counter++);
      if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
        extra = string.charCodeAt(counter++);
        if ((extra & 0xFC00) == 0xDC00) {
          output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
        } else {
          output.push(value);
          counter--;
        }
      } else {
        output.push(value);
      }
    }
    return output;
  }

  function ucs2encode(array) {
    var length = array.length;
    var output = '';
    for (var i = 0; i < length; i++) {
      var value = array[i];
      if (value > 0xFFFF) {
        value -= 0x10000;
        output += String.fromCharCode(value >>> 10 & 0x3FF | 0xD800);
        output += String.fromCharCode(0xDC00 | value & 0x3FF);
      } else {
        output += String.fromCharCode(value);
      }
    }
    return output;
  }

  function basicToDigit(codePoint) {
    if (codePoint - 48 < 10) return codePoint - 22;
    if (codePoint - 65 < 26) return codePoint - 65;
    if (codePoint - 97 < 26) return codePoint - 97;
    return base;
  }

  function digitToBasic(digit, flag) {
    return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
  }

  function adapt(delta, numPoints, firstTime) {
    delta = firstTime ? Math.floor(delta / damp) : delta >> 1;
    delta += Math.floor(delta / numPoints);
    var k = 0;
    while (delta > ((base - tMin) * tMax) >> 1) {
      delta = Math.floor(delta / (base - tMin));
      k += base;
    }
    return k + Math.floor((base - tMin + 1) * delta / (delta + skew));
  }

  function decode(input) {
    var output = [];
    var inputLength = input.length;
    var out, i = 0, n = initialN, bias = initialBias, basic, j, oldi, w, k, digit, t, baseMinusT;
    basic = input.lastIndexOf(delimiter);
    if (basic < 0) basic = 0;
    for (j = 0; j < basic; ++j) {
      if (input.charCodeAt(j) >= 0x80) error('not-basic');
      output.push(input.charCodeAt(j));
    }
    for (var index = basic > 0 ? basic + 1 : 0; index < inputLength; ) {
      for (oldi = i, w = 1, k = base; ; k += base) {
        if (index >= inputLength) error('invalid-input');
        digit = basicToDigit(input.charCodeAt(index++));
        if (digit >= base || digit > Math.floor((maxInt - i) / w)) error('overflow');
        i += digit * w;
        t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
        if (digit < t) break;
        baseMinusT = base - t;
        if (w > Math.floor(maxInt / baseMinusT)) error('overflow');
        w *= baseMinusT;
      }
      out = output.length + 1;
      bias = adapt(i - oldi, out, oldi == 0);
      if (Math.floor(i / out) > maxInt - n) error('overflow');
      n += Math.floor(i / out);
      i %= out;
      output.splice(i++, 0, n);
    }
    return ucs2encode(output);
  }

  function encode(input) {
    var n, delta, handledCPCount, basicLength, bias, j, m, q, k, t, currentValue, output = [];
    input = ucs2decode(input);
    var inputLength = input.length;
    n = initialN;
    delta = 0;
    bias = initialBias;
    for (var i = 0; i < inputLength; ++i) {
      currentValue = input[i];
      if (currentValue < 0x80) output.push(String.fromCharCode(currentValue));
    }
    handledCPCount = basicLength = output.length;
    if (basicLength) output.push(delimiter);
    while (handledCPCount < inputLength) {
      for (m = maxInt, i = 0; i < inputLength; ++i) {
        currentValue = input[i];
        if (currentValue >= n && currentValue < m) m = currentValue;
      }
      if (m - n > Math.floor((maxInt - delta) / (handledCPCount + 1))) error('overflow');
      delta += (m - n) * (handledCPCount + 1);
      n = m;
      for (i = 0; i < inputLength; ++i) {
        currentValue = input[i];
        if (currentValue < n) {
          if (++delta > maxInt) error('overflow');
        }
        if (currentValue == n) {
          for (q = delta, k = base; ; k += base) {
            t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
            if (q < t) break;
            output.push(String.fromCharCode(digitToBasic(t + (q - t) % (base - t), 0)));
            q = Math.floor((q - t) / (base - t));
          }
          output.push(String.fromCharCode(digitToBasic(q, 0)));
          bias = adapt(delta, handledCPCount + 1, handledCPCount == basicLength);
          delta = 0;
          ++handledCPCount;
        }
      }
      ++delta;
      ++n;
    }
    return output.join('');
  }

  function toUnicode(input) {
    return mapDomain(input, function(string) {
      return regexPunycode.test(string) ? decode(string.slice(4)) : string;
    });
  }

  function toASCII(input) {
    return mapDomain(input, function(string) {
      return regexNonASCII.test(string) ? 'xn--' + encode(string) : string;
    });
  }

  var punycode = {
    version: '2.3.1',
    ucs2: {
      decode: ucs2decode,
      encode: ucs2encode
    },
    decode: decode,
    encode: encode,
    toASCII: toASCII,
    toUnicode: toUnicode
  };

  if (typeof module != 'undefined' && module.exports) {
    module.exports = punycode;
  } else {
    global.punycode = punycode;
  }
}(this));