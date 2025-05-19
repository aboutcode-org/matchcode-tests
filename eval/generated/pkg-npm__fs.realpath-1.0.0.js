var path = require('path');
var fs = require('fs');

function maybeCallback(cb) {
  return typeof cb === 'function' ? cb : function () {};
}

function normalizeArray(parts, allowAboveRoot) {
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    if (parts[i] === '.') {
      parts.splice(i, 1);
    } else if (parts[i] === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }
  if (allowAboveRoot) {
    while (up--) {
      parts.unshift('..');
    }
  }
  return parts;
}

function normalizePath(p) {
  var isAbs = path.isAbsolute(p);
  var trailingSlash = p.substr(-1) === '/';
  p = normalizeArray(p.split('/').filter(Boolean), !isAbs).join('/');
  if (!p && !isAbs) p = '.';
  if (p && trailingSlash) p += '/';
  return (isAbs ? '/' : '') + p;
}

function realpathSync(p, cache) {
  p = path.resolve(p);

  if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
    return cache[p];
  }

  var seenLinks = {};
  var original = p, seen = [];

  while (true) {
    var stat;
    try {
      stat = fs.lstatSync(p);
    } catch (err) {
      err.path = p;
      throw err;
    }
    if (!stat.isSymbolicLink()) break;

    if (Object.prototype.hasOwnProperty.call(seenLinks, p)) {
      throw new Error('Circular symlink detected at: ' + p);
    }
    seenLinks[p] = true;
    seen.push(p);

    var link;
    try {
      link = fs.readlinkSync(p);
    } catch (err) {
      err.path = p;
      throw err;
    }

    p = path.resolve(path.dirname(p), link);
  }

  p = normalizePath(p);

  for (var i = 0; i < seen.length; i++) {
    cache && (cache[seen[i]] = p);
  }
  cache && (cache[original] = p);

  return p;
}

function realpath(p, cache, cb) {
  cb = maybeCallback(cb);
  p = path.resolve(p);

  if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
    return process.nextTick(function () { cb(null, cache[p]); });
  }

  var seenLinks = {};
  var seen = [];
  var original = p;

  function next(current) {
    fs.lstat(current, function (err, stat) {
      if (err) {
        err.path = current;
        return cb(err);
      }
      if (!stat.isSymbolicLink()) {
        current = normalizePath(current);

        for (var i = 0; i < seen.length; i++) {
          cache && (cache[seen[i]] = current);
        }
        cache && (cache[original] = current);

        return cb(null, current);
      }
      if (Object.prototype.hasOwnProperty.call(seenLinks, current)) {
        return cb(new Error('Circular symlink detected at: ' + current));
      }
      seenLinks[current] = true;
      seen.push(current);

      fs.readlink(current, function (err2, link) {
        if (err2) {
          err2.path = current;
          return cb(err2);
        }
        var resolved = path.resolve(path.dirname(current), link);
        next(resolved);
      });
    });
  }

  next(p);
}

module.exports = realpath;
module.exports.realpath = realpath;
module.exports.realpathSync = realpathSync;