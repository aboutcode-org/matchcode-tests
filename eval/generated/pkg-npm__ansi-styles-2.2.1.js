
var styles = {
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
	grey: [90, 39],

	bgBlack: [40, 49],
	bgRed: [41, 49],
	bgGreen: [42, 49],
	bgYellow: [43, 49],
	bgBlue: [44, 49],
	bgMagenta: [45, 49],
	bgCyan: [46, 49],
	bgWhite: [47, 49]
};

function wrapAnsi(code, close) {
	code = '\u001b[' + code + 'm';
	close = '\u001b[' + close + 'm';
	return function (str) {
		var idx = str.indexOf(close, 4);
		return code + (~idx ? str.replace(close, code) : str) + close;
	};
}

var ansiStyles = {};

Object.keys(styles).forEach(function (key) {
	var open = styles[key][0];
	var close = styles[key][1];
	ansiStyles[key] = wrapAnsi(open, close);
	ansiStyles[key].open = '\u001b[' + open + 'm';
	ansiStyles[key].close = '\u001b[' + close + 'm';
});

module.exports = ansiStyles;