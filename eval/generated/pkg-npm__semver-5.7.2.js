(function(global) {
  function SemVer(version) {
    if (!(this instanceof SemVer)) return new SemVer(version);
    if (typeof version !== 'string') throw new TypeError('Invalid version: ' + version);
    var matched = version.trim().match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([\w\.-]+))?(?:\+([\w\.-]+))?$/);
    if (!matched) throw new TypeError('Invalid version: ' + version);
    this.major = parseInt(matched[1], 10);
    this.minor = parseInt(matched[2], 10);
    this.patch = parseInt(matched[3], 10);
    this.prerelease = matched[4] ? matched[4].split('.') : [];
    this.build = matched[5] ? matched[5].split('.') : [];
    this.version = version;
  }

  SemVer.prototype.compare = function(other) {
    if (!(other instanceof SemVer)) other = new SemVer(other);
    if (this.major !== other.major) return compareNum(this.major, other.major);
    if (this.minor !== other.minor) return compareNum(this.minor, other.minor);
    if (this.patch !== other.patch) return compareNum(this.patch, other.patch);
    return comparePr(this.prerelease, other.prerelease);
  };

  SemVer.prototype.compareMain = function(other) {
    if (!(other instanceof SemVer)) other = new SemVer(other);
    if (this.major !== other.major) return compareNum(this.major, other.major);
    if (this.minor !== other.minor) return compareNum(this.minor, other.minor);
    return compareNum(this.patch, other.patch);
  };

  SemVer.prototype.comparePre = function(other) {
    if (!(other instanceof SemVer)) other = new SemVer(other);
    return comparePr(this.prerelease, other.prerelease);
  };

  SemVer.prototype.inc = function(release) {
    switch (release) {
      case 'major':
        this.major += 1;
        this.minor = 0;
        this.patch = 0;
        this.prerelease = [];
        break;
      case 'minor':
        this.minor += 1;
        this.patch = 0;
        this.prerelease = [];
        break;
      case 'patch':
        this.patch += 1;
        this.prerelease = [];
        break;
      case 'prerelease':
        if (!this.prerelease.length) {
          this.prerelease = [0];
        } else {
          var last = this.prerelease.length - 1;
          if (typeof this.prerelease[last] === 'number') {
            this.prerelease[last]++;
          } else {
            this.prerelease.push(0);
          }
        }
        break;
    }
    return this;
  };

  function compareNum(a, b) {
    return a > b ? 1 : a < b ? -1 : 0;
  }

  function isNum(x) {
    return /^[0-9]+$/.test(x);
  }

  function comparePr(a, b) {
    if (!a.length && b.length) return 1;
    if (a.length && !b.length) return -1;
    for (var i = 0; i < Math.max(a.length, b.length); i++) {
      if (a[i] === undefined) return -1;
      if (b[i] === undefined) return 1;
      if (a[i] === b[i]) continue;
      var anum = isNum(a[i]);
      var bnum = isNum(b[i]);
      if (anum && bnum) {
        return compareNum(+a[i], +b[i]);
      }
      if (anum) return -1;
      if (bnum) return 1;
      if (a[i] < b[i]) return -1;
      if (a[i] > b[i]) return 1;
    }
    return 0;
  }

  function valid(version) {
    try {
      return new SemVer(version);
    } catch (e) {
      return null;
    }
  }

  function satisfies(v, range) {
    if (!(v instanceof SemVer)) v = new SemVer(v);
    var comps = parseRange(range);
    for (var i = 0; i < comps.length; i++) {
      var c = comps[i];
      var op = c[0], ver = c[1];
      var sv = new SemVer(ver);
      var r = v.compare(sv);
      switch (op) {
        case '>': if (!(r > 0)) return false; break;
        case '>=': if (!(r >= 0)) return false; break;
        case '<': if (!(r < 0)) return false; break;
        case '<=': if (!(r <= 0)) return false; break;
        case '=': if (!(r === 0)) return false; break;
      }
    }
    return true;
  }

  function parseRange(range) {
    var regex = /([><=]*)\s*([0-9]+(?:\.[0-9]+){2}(?:-[\w.-]+)?)/g;
    var m, out = [];
    while ((m = regex.exec(range))) {
      out.push([m[1] || '=', m[2]]);
    }
    return out;
  }

  var semver = {
    SemVer: SemVer,
    valid: valid,
    compare: function(a, b) {
      return new SemVer(a).compare(b);
    },
    satisfies: satisfies
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = semver;
  } else {
    global.semver = semver;
  }
})(typeof window !== 'undefined' ? window : global);