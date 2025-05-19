
var escape = function(str) {
  return String(str).replace(/[^\x20-\x7E]/g, '');
};

var wrapAnsi = function(code) {
  return '\u001B[' + code + 'm';
};

var codes = {
  reset: [0, 0],
  bold: [1, 22],
  dim: [2, 22],
  italic: [3, 23],
  underline: [4, 24],
  inverse: [7, 27],
  hidden: [8, 28],
  strikethrough: [9, 29],
  black: [30, 39],
  red: [31, 39],
  green: [32, 39],
  yellow: [33, 39],
  blue: [34, 39],
  magenta: [35, 39],
  cyan: [36, 39],
  white: [37, 39],
  gray: [90, 39],
  bgBlack: [40, 49],
  bgRed: [41, 49],
  bgGreen: [42, 49],
  bgYellow: [43, 49],
  bgBlue: [44, 49],
  bgMagenta: [45, 49],
  bgCyan: [46, 49],
  bgWhite: [47, 49]
};

var style = function(open, close) {
  return {
    open: wrapAnsi(open),
    close: wrapAnsi(close),
    wrap: function(str) {
      return this.open + escape(str) + this.close;
    }
  };
};

var styles = {};
for (var key in codes) {
  styles[key] = style(codes[key][0], codes[key][1]);
}

styles.rgb = function(r, g, b) {
  return {
    open: '\u001B[38;2;' + r + ';' + g + ';' + b + 'm',
    close: wrapAnsi(39),
    wrap: function(str) {
      return this.open + escape(str) + this.close;
    }
  };
};

styles.bgRgb = function(r, g, b) {
  return {
    open: '\u001B[48;2;' + r + ';' + g + ';' + b + 'm',
    close: wrapAnsi(49),
    wrap: function(str) {
      return this.open + escape(str) + this.close;
    }
  };
};

styles.hex = function(hex) {
  var bigint = parseInt(hex.replace(/^#/, ''), 16);
  var r = (bigint >> 16) & 255;
  var g = (bigint >> 8) & 255;
  var b = bigint & 255;
  return styles.rgb(r, g, b);
};

styles.bgHex = function(hex) {
  var bigint = parseInt(hex.replace(/^#/, ''), 16);
  var r = (bigint >> 16) & 255;
  var g = (bigint >> 8) & 255;
  var b = bigint & 255;
  return styles.bgRgb(r, g, b);
};

module.exports = styles;