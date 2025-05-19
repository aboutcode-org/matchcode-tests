var fs = require('fs');
var path = require('path');

function minimatch(file, pattern) {
  var regex = new RegExp('^' + pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.') + '$');
  return regex.test(file);
}

function globSync(pattern, options) {
  options = options || {};
  var cwd = options.cwd || process.cwd();
  var matches = [];

  function traverse(dir) {
    var files;
    try {
      files = fs.readdirSync(dir);
    } catch (e) {
      return;
    }
    for (var i = 0; i < files.length; i++) {
      var p = path.join(dir, files[i]);
      var rel = path.relative(cwd, p);
      var stat;
      try {
        stat = fs.statSync(p);
      } catch (e) {
        continue;
      }
      if (minimatch(rel, pattern)) {
        matches.push(rel.split(path.sep).join('/'));
      }
      if (stat.isDirectory()) {
        traverse(p);
      }
    }
  }

  var abs = path.isAbsolute(pattern) ? '' : cwd;
  if (pattern.indexOf('**') === -1 && pattern.indexOf('*') === -1 && pattern.indexOf('?') === -1) {
    var file = path.join(cwd, pattern);
    try {
      if (fs.existsSync(file)) {
        matches.push(pattern);
      }
    } catch (e) {}
    return matches;
  }

  traverse(cwd);
  return matches;
}

module.exports = {
  globSync: globSync
};