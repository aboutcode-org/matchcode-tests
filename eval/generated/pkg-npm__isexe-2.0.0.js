var fs = require("fs");
var path = require("path");
function isWindows() {
  return process.platform === "win32";
}
function isexe(file, options, cb) {
  var stat;
  if (typeof options === "function") {
    cb = options;
    options = {};
  }
  if (!cb) throw new Error("Callback required");
  fs.stat(file, function (er, stat) {
    if (er) return cb(null, false);
    if (isWindows()) {
      return checkWindows(file, options, cb);
    } else {
      return checkPosix(stat, options, cb);
    }
  });
}
function isexeSync(file, options) {
  options = options || {};
  try {
    var stat = fs.statSync(file);
  } catch (er) {
    return false;
  }
  if (isWindows()) {
    return checkWindowsSync(file, options);
  } else {
    return checkPosixSync(stat, options);
  }
}
function checkWindows(file, options, cb) {
  var pathExt = options.pathExt || process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM";
  var exts = pathExt.split(";");
  var fileExt = path.extname(file).toUpperCase();
  if (!fileExt) {
    file = file + ".exe";
  }
  fs.access(file, fs.constants.F_OK, function (err) {
    cb(null, !err);
  });
}
function checkWindowsSync(file, options) {
  var pathExt = options.pathExt || process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM";
  var exts = pathExt.split(";");
  var fileExt = path.extname(file).toUpperCase();
  if (!fileExt) {
    file = file + ".exe";
  }
  try {
    fs.accessSync(file, fs.constants.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}
function checkPosix(stat, options, cb) {
  if (!stat.isFile()) return cb(null, false);
  var mode = stat.mode;
  var uid = options.uid != null ? options.uid : process.getuid && process.getuid();
  var gid = options.gid != null ? options.gid : process.getgid && process.getgid();
  if (uid === 0) {
    return cb(null, true);
  }
  var isOwner = stat.uid === uid;
  var isGroup = stat.gid === gid;
  if (isOwner && mode & 0o100) return cb(null, true);
  if (isGroup && mode & 0o010) return cb(null, true);
  if (mode & 0o001) return cb(null, true);
  return cb(null, false);
}
function checkPosixSync(stat, options) {
  if (!stat.isFile()) return false;
  var mode = stat.mode;
  var uid = options.uid != null ? options.uid : process.getuid && process.getuid();
  var gid = options.gid != null ? options.gid : process.getgid && process.getgid();
  if (uid === 0) {
    return true;
  }
  var isOwner = stat.uid === uid;
  var isGroup = stat.gid === gid;
  if (isOwner && mode & 0o100) return true;
  if (isGroup && mode & 0o010) return true;
  if (mode & 0o001) return true;
  return false;
}
module.exports = isexe;
module.exports.sync = isexeSync;