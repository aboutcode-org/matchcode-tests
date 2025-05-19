
function trimRight(str) {
  var s = str;
  var i = s.length - 1;
  while (i >= 0 && (s[i] === '/' || s[i] === '\\')) {
    i--;
  }
  if (i < s.length - 1) {
    s = s.slice(0, i + 1);
  }
  return s;
}

function isWindowsDeviceRoot(code) {
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

function parseDevice(str) {
  if (str.length < 2 || str[1] !== ':') return '';
  var code = str.charCodeAt(0);
  if (!isWindowsDeviceRoot(code)) return '';
  return str.slice(0, 2);
}

function parse(pathString) {
  if (typeof pathString !== 'string' && !(pathString instanceof String)) {
    throw new TypeError('Parameter "pathString" must be a string, not ' + typeof pathString);
  }

  var ret = {
    root: '',
    dir: '',
    base: '',
    ext: '',
    name: ''
  };

  if (pathString.length === 0) return ret;

  var isWindows = false, code = null;
  for (var i = 0; i < pathString.length; ++i) {
    code = pathString.charCodeAt(i);
    if (code === 47) break;
    if (code === 92) { isWindows = true; break; }
  }

  var sep = isWindows ? '\\' : '/';
  var path = pathString;

  var device = '';
  var isUnc = false;

  if (isWindows) {
    device = parseDevice(path);
    if (device) path = path.slice(device.length);
    if (path.length >= 2 && path[0] === sep && path[1] === sep) {
      isUnc = true;
      var j = 2;
      var firstNonSep = j;
      while (j < path.length && path[j] !== sep) ++j;
      if (j < path.length && j !== firstNonSep) {
        var server = path.slice(firstNonSep, j);
        ++j;
        var secondNonSep = j;
        while (j < path.length && path[j] !== sep) ++j;
        if (j > secondNonSep) {
          var share = path.slice(secondNonSep, j);
          device = '\\\\' + server + '\\' + share;
          path = path.slice(j);
        }
      }
    }
  }

  ret.root = device || (path[0] === sep ? sep : '');

  var start = ret.root.length;
  var end = path.length;
  var lastSep = -1, lastDot = -1, i = end - 1;

  for (; i >= start; --i) {
    code = path.charCodeAt(i);
    if (code === 47 || code === 92) {
      lastSep = i;
      break;
    }
    if (lastDot === -1 && code === 46) {
      lastDot = i;
    }
  }

  if (lastSep >= 0) {
    if (start < lastSep) {
      ret.dir = ret.root + path.slice(start, lastSep);
    } else {
      ret.dir = ret.root;
    }
    ret.base = path.slice(lastSep + 1, end);
  } else {
    ret.dir = '';
    ret.base = path.slice(start, end);
  }

  if (ret.base) {
    var dot = lastDot - lastSep;
    if (dot > 0) {
      ret.name = ret.base.slice(0, dot - 1);
      ret.ext = ret.base.slice(dot - 1);
    } else {
      ret.name = ret.base;
      ret.ext = '';
    }
  }

  return ret;
}

function format(pathObject) {
  if (typeof pathObject !== 'object' || pathObject === null) {
    throw new TypeError('Parameter "pathObject" must be an object, not ' + typeof pathObject);
  }
  var dir = pathObject.dir || pathObject.root || '';
  var base = pathObject.base || '';
  if (!base) {
    var name = pathObject.name || '';
    var ext = pathObject.ext || '';
    base = name + ext;
  }
  if (dir) {
    if (dir === pathObject.root) return dir + base;
    return dir + '/' + base;
  }
  return base;
}

function basename(pathString, ext) {
  var f = parse(pathString).base;
  if (ext && f.slice(-ext.length) === ext) {
    f = f.slice(0, -ext.length);
  }
  return f;
}

function dirname(pathString) {
  return parse(pathString).dir;
}

function extname(pathString) {
  return parse(pathString).ext;
}

module.exports = {
  parse: parse,
  format: format,
  basename: basename,
  dirname: dirname,
  extname: extname
};