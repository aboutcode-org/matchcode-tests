'use strict';

var os = require('os');
var hasFlag = function(flag) {
  var argv = process.argv;
  var prefix = /^--/;
  for (var i = 0; i < argv.length; i++) {
    if (prefix.test(argv[i]) && argv[i].indexOf(flag) !== -1) {
      return true;
    }
  }
  return false;
};

function envForceColor() {
  if ('FORCE_COLOR' in process.env) {
    if (process.env.FORCE_COLOR === 'true') return 1;
    if (process.env.FORCE_COLOR === 'false') return 0;
    return 1;
  }
  return null;
}

function translateLevel(level) {
  if (level === 0) return false;
  return {
    level: level,
    hasBasic: true,
    has256: level >= 2,
    has16m: level >= 3
  };
}

function getSupportLevel(stream) {
  var forceColor = envForceColor();
  if (forceColor === 0) return 0;
  if (hasFlag('no-color') || hasFlag('no-colors') || hasFlag('color=false')) return 0;
  if (hasFlag('color') || hasFlag('colors') || hasFlag('color=true')) return 1;
  if (process.env.TERM === 'dumb') return forceColor === 1 ? 1 : 0;
  if (process.platform === 'win32' && os.release().split('.')[0] >= 10) return 2;
  if ('CI' in process.env) {
    if ('TRAVIS' in process.env || 'CIRCLECI' in process.env || 'APPVEYOR' in process.env || 'GITLAB_CI' in process.env || process.env.CI_NAME === 'codeship') {
      return 1;
    }
    return 0;
  }
  if ('TEAMCITY_VERSION' in process.env) {
    return /^9\.(0*[1-9]\d*)\.|\d{2,}\./.test(process.env.TEAMCITY_VERSION) ? 1 : 0;
  }
  if (/^(xterm|rxvt|vt100|color|ansi|cygwin|linux)/i.test(process.env.TERM)) return 1;
  if ('COLORTERM' in process.env) return 1;
  if (/\b256(color)?\b/.test(process.env.TERM)) return 2;
  if (/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(process.env.TERM)) return 1;
  if ('TERM_PROGRAM' in process.env) {
    var version = parseInt((process.env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);
    switch (process.env.TERM_PROGRAM) {
      case 'iTerm.app':
        return version >= 3 ? 3 : 2;
      case 'Apple_Terminal':
        return 2;
    }
  }
  return forceColor === 1 ? 1 : 0;
}

function supportsColor(stream) {
  var level = getSupportLevel(stream);
  return translateLevel(level);
}

module.exports = supportsColor;