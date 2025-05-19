var path = require('path');

function Minimatch(pattern, options) {
  if (!(this instanceof Minimatch)) return new Minimatch(pattern, options);
  if (!pattern) throw new TypeError('A glob pattern is required');
  this.options = options || {};
  this.pattern = pattern.trim();
  this.set = [];
  this.regexp = null;
  this.negate = false;
  this.comment = false;
  this.empty = false;
  this._parse();
}

function minimatch(target, pattern, options) {
  if (!(typeof target === 'string')) target = String(target);
  var mm = new Minimatch(pattern, options);
  return mm.match(target);
}

minimatch.Minimatch = Minimatch;

Minimatch.prototype._parse = function() {
  var pattern = this.pattern;
  if (pattern.charAt(0) === '#') {
    this.comment = true;
    return;
  }
  if (!pattern) {
    this.empty = true;
    return;
  }
  var negate = false, negateOffset = 0;
  for (var i = 0, l = pattern.length; i < l && pattern.charAt(i) === '!'; i++) {
    negate = !negate;
    negateOffset++;
  }
  if (negateOffset) this.pattern = pattern.substr(negateOffset);
  this.negate = negate;

  this.set = this._braceExpand();
  this.regexp = this.makeRe();
};

Minimatch.prototype._braceExpand = function() {
  var pattern = this.pattern;
  var set = [pattern];

  var stack = [], escaping = false, inBraces = false;
  for (var i = 0; i < pattern.length; i++) {
    var c = pattern.charAt(i);
    if (c === '\\' && !escaping) {
      escaping = true;
      continue;
    }
    if (c === '{' && !escaping) {
      inBraces = true;
      break;
    }
    escaping = false;
  }
  if (!inBraces) return [pattern];

  var parts = expandBraces(pattern);
  return parts;
};

function expandBraces(pattern) {
  var res = [], stack = [], inBrace = false, braceStart = -1;
  for (var i = 0; i < pattern.length; i++) {
    var c = pattern.charAt(i);
    if (c === '\\') {
      i += 1;
      continue;
    }
    if (c === '{') {
      if (!inBrace) {
        inBrace = true;
        braceStart = i;
      }
      continue;
    }
    if (c === '}' && inBrace) {
      var pre = pattern.slice(0, braceStart);
      var post = pattern.slice(i + 1);
      var body = pattern.slice(braceStart + 1, i);
      var parts = body.split(',');
      for (var j = 0; j < parts.length; j++) {
        var expanded = pre + parts[j] + post;
        res = res.concat(expandBraces(expanded));
      }
      return res;
    }
  }
  return [pattern];
}

Minimatch.prototype.makeRe = function() {
  if (this.regexp) return this.regexp;
  var set = this.set;
  var options = this.options;

  var re = set.map(function(pat) {
    var re = pat
      .replace(/([\\\^\$\+\?\.\(\)\|{}\[\]])/g, '\\$1')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return '^' + re + '$';
  }).join('|');

  try {
    this.regexp = new RegExp(re, options.nocase ? 'i' : '');
  } catch (er) {
    this.regexp = false;
  }
  return this.regexp;
};

Minimatch.prototype.match = function(target) {
  if (typeof target !== 'string') return false;
  if (this.comment) return false;
  if (this.empty) return target === '';
  var targetPath = target;
  if (!this.options.matchBase && path.sep !== '/') targetPath = target.split(path.sep).join('/');
  var match = this.regexp && this.regexp.test(targetPath);
  return this.negate ? !match : !!match;
};

module.exports = minimatch;