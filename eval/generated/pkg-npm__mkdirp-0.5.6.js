var fs = require('fs');

function mkdirp(dir, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }
  opts = opts || {};
  var mode = opts.mode;
  var made = null;

  dir = path.resolve(dir);

  function inner(p, callback) {
    fs.mkdir(p, mode, function(er) {
      if (!er) {
        made = made || p;
        return callback(null, made);
      }
      switch (er.code) {
        case 'ENOENT':
          inner(path.dirname(p), function(er2, made2) {
            if (er2) return callback(er2, made2);
            inner(p, callback);
          });
          break;
        default:
          fs.stat(p, function(er2, stat) {
            if (er2 || !stat.isDirectory()) {
              callback(er, made);
            } else {
              callback(null, made);
            }
          });
          break;
      }
    });
  }

  inner(dir, cb || function(){});
}

mkdirp.sync = function sync(dir, opts, made) {
  opts = opts || {};
  var mode = opts.mode;
  dir = path.resolve(dir);
  if (!made) made = null;
  try {
    fs.mkdirSync(dir, mode);
    made = made || dir;
  } catch (err0) {
    switch (err0.code) {
      case 'ENOENT':
        made = sync(path.dirname(dir), opts, made);
        sync(dir, opts, made);
        break;
      default:
        var stat;
        try {
          stat = fs.statSync(dir);
        } catch (err1) {
          throw err0;
        }
        if (!stat.isDirectory()) throw err0;
        break;
    }
  }
  return made;
};

module.exports = mkdirp;