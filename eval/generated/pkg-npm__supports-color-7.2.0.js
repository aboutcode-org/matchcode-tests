
var os = require('os');
var processEnv = process.env;

function hasFlag(flag, argv) {
  argv = argv || process.argv;
  var prefix = flag.startsWith('--') ? '' : '--';
  var pos = argv.indexOf(prefix + flag);
  var terminatorPos = argv.indexOf('--');
  return pos !== -1 && (terminatorPos === -1 || pos < terminatorPos);
}

function envForceColor() {
  if ('FORCE_COLOR' in processEnv) {
    if (processEnv.FORCE_COLOR === 'true') return 3;
    if (processEnv.FORCE_COLOR === 'false') return 0;
    if (processEnv.FORCE_COLOR === '0') return 0;
    return 3;
  }
  return null;
}

function detectTerm(program) {
  if (!program) return 0;
  var term = program.toLowerCase();
  if (term === 'dumb') return 0;
  if (term.indexOf('xterm') !== -1) return 1;
  if (term.indexOf('vt100') !== -1) return 1;
  if (term.indexOf('color') !== -1) return 1;
  return 0;
}

function getColorDepth() {
  var forceColor = envForceColor();
  if (forceColor !== null) { return forceColor; }
  if (hasFlag('no-color') || hasFlag('no-colors') ||
      hasFlag('color=false') || hasFlag('color=never')) {
    return 0;
  }
  if (hasFlag('color=16m') || hasFlag('color=full') || hasFlag('color=truecolor')) {
    return 3;
  }
  if (hasFlag('color=256')) {
    return 2;
  }
  if (hasFlag('color') || hasFlag('colors') || hasFlag('color=true') || hasFlag('color=always')) {
    return 1;
  }

  if (!process.stdout || !process.stdout.isTTY) {
    return 0;
  }
  var term = processEnv.TERM || '';
  if (detectTerm(term)) return 1;

  if (process.platform === 'win32') {
    var osRelease = os.release().split('.');
    if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
      return 2;
    }
    return 1;
  }

  if ('COLORTERM' in processEnv) {
    if (processEnv.COLORTERM.match(/truecolor|24bit/i)) {
      return 3;
    }
    return 1;
  }

  if (term.match(/-256(color)?$/)) {
    return 2;
  }

  return 0;
}

var level = getColorDepth();
var supportsColor = level > 0 ? { level: level, hasBasic: level >= 1, has256: level >= 2, has16m: level >= 3 } : false;
module.exports = supportsColor;