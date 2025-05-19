var ANSI = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  italic:  '\x1b[3m',
  underline: '\x1b[4m',
  inverse: '\x1b[7m',
  hidden:  '\x1b[8m',
  strikethrough: '\x1b[9m',
  black:   '\x1b[30m',
  red:     '\x1b[31m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  blue:    '\x1b[34m',
  magenta: '\x1b[35m',
  cyan:    '\x1b[36m',
  white:   '\x1b[37m',
  gray:    '\x1b[90m',
  bgBlack:   '\x1b[40m',
  bgRed:     '\x1b[41m',
  bgGreen:   '\x1b[42m',
  bgYellow:  '\x1b[43m',
  bgBlue:    '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan:    '\x1b[46m',
  bgWhite:   '\x1b[47m'
};
function create(x) {
  return function(str) {
    if (!isEnabled) return String(str);
    return x + String(str) + ANSI.reset;
  }
}
var isEnabled = typeof process !== 'undefined' &&
  process.env && process.env.FORCE_COLOR !== '0' &&
  (process.env.FORCE_COLOR === '1' ||
   process.stdout && process.stdout.isTTY);
var colors = {};
for (var key in ANSI) {
  colors[key] = create(ANSI[key]);
}
colors.isColorSupported = !!isEnabled;
module.exports = colors;