
var ansiStyles = {
  reset: ['\u001b[0m', '\u001b[0m'],
  bold: ['\u001b[1m', '\u001b[22m'],
  dim: ['\u001b[2m', '\u001b[22m'],
  italic: ['\u001b[3m', '\u001b[23m'],
  underline: ['\u001b[4m', '\u001b[24m'],
  inverse: ['\u001b[7m', '\u001b[27m'],
  hidden: ['\u001b[8m', '\u001b[28m'],
  strikethrough: ['\u001b[9m', '\u001b[29m'],

  black: ['\u001b[30m', '\u001b[39m'],
  red: ['\u001b[31m', '\u001b[39m'],
  green: ['\u001b[32m', '\u001b[39m'],
  yellow: ['\u001b[33m', '\u001b[39m'],
  blue: ['\u001b[34m', '\u001b[39m'],
  magenta: ['\u001b[35m', '\u001b[39m'],
  cyan: ['\u001b[36m', '\u001b[39m'],
  white: ['\u001b[37m', '\u001b[39m'],
  gray: ['\u001b[90m', '\u001b[39m'],
  grey: ['\u001b[90m', '\u001b[39m'],

  bgBlack: ['\u001b[40m', '\u001b[49m'],
  bgRed: ['\u001b[41m', '\u001b[49m'],
  bgGreen: ['\u001b[42m', '\u001b[49m'],
  bgYellow: ['\u001b[43m', '\u001b[49m'],
  bgBlue: ['\u001b[44m', '\u001b[49m'],
  bgMagenta: ['\u001b[45m', '\u001b[49m'],
  bgCyan: ['\u001b[46m', '\u001b[49m'],
  bgWhite: ['\u001b[47m', '\u001b[49m']
};

function applyStyle(style, str) {
  var open = ansiStyles[style][0];
  var close = ansiStyles[style][1];
  var idx = str.indexOf(close, open.length);
  return open + (~idx ? str.replace(close, open) : str) + close;
}

function Chalk(styles) {
  if (!(this instanceof Chalk)) return new Chalk(styles);
  this._styles = styles || [];
}

var styleNames = Object.keys(ansiStyles);

styleNames.forEach(function(style) {
  Object.defineProperty(Chalk.prototype, style, {
    get: function() {
      var self = this;
      var newStyles = self._styles.concat([style]);
      return new Chalk(newStyles);
    }
  });
});

Chalk.prototype._apply = function(str) {
  var out = str;
  for (var i = 0; i < this._styles.length; i++) {
    out = applyStyle(this._styles[i], out);
  }
  return out;
};

function chalk(str) {
  return chalk._apply(str);
}

Chalk.prototype.toString = function() {
  return this._apply.apply(this, arguments);
};

styleNames.forEach(function(style) {
  chalk[style] = Chalk.prototype[style];
});

Object.setPrototypeOf(chalk, Chalk.prototype);

module.exports = chalk;