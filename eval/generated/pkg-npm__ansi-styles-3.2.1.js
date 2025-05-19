
var wrapAnsi16 = function (fn, offset) {
	return function (code) {
		return '\u001B[' + (fn(code) + offset) + 'm';
	};
};

var wrapAnsi256 = function (fn, offset) {
	return function (code) {
		return '\u001B[' + offset + ';5;' + fn(code) + 'm';
	};
};

var wrapAnsi16m = function (fn, offset) {
	return function (r, g, b) {
		return '\u001B[' + offset + ';2;' + fn(r) + ';' + fn(g) + ';' + fn(b) + 'm';
	};
};

var code = function (x) { return x; };
var isArray = Array.isArray;

var ansiStyles = {
	modifier: {
		reset: [0, 0],
		bold: [1, 22],
		dim: [2, 22],
		italic: [3, 23],
		underline: [4, 24],
		inverse: [7, 27],
		hidden: [8, 28],
		strikethrough: [9, 29]
	},
	color: {
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
		blackBright: [90, 39],
		redBright: [91, 39],
		greenBright: [92, 39],
		yellowBright: [93, 39],
		blueBright: [94, 39],
		magentaBright: [95, 39],
		cyanBright: [96, 39],
		whiteBright: [97, 39]
	},
	bgColor: {
		bgBlack: [40, 49],
		bgRed: [41, 49],
		bgGreen: [42, 49],
		bgYellow: [43, 49],
		bgBlue: [44, 49],
		bgMagenta: [45, 49],
		bgCyan: [46, 49],
		bgWhite: [47, 49],
		bgGray: [100, 49],
		bgGrey: [100, 49],
		bgBlackBright: [100, 49],
		bgRedBright: [101, 49],
		bgGreenBright: [102, 49],
		bgYellowBright: [103, 49],
		bgBlueBright: [104, 49],
		bgMagentaBright: [105, 49],
		bgCyanBright: [106, 49],
		bgWhiteBright: [107, 49]
	}
};

var rgbToAnsi256 = function (r, g, b) {
	if (r === g && g === b) {
		if (r < 8) {
			return 16;
		}
		if (r > 248) {
			return 231;
		}
		return Math.round(((r - 8) / 247) * 24) + 232;
	}
	var ansi = 16 + 
		(36 * Math.round(r / 255 * 5)) +
		(6 * Math.round(g / 255 * 5)) +
		Math.round(b / 255 * 5);
	return ansi;
};

var hexToRgb = function (hex) {
	hex = hex.replace(/^#/, '');
	if (hex.length === 3) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	var num = parseInt(hex, 16);
	return [
		(num >> 16) & 255,
		(num >> 8) & 255,
		num & 255
	];
};

ansiStyles.color.ansi = wrapAnsi16(code, 30);
ansiStyles.color.ansi256 = wrapAnsi256(code, 38);
ansiStyles.color.ansi16m = wrapAnsi16m(code, 38);
ansiStyles.bgColor.ansi = wrapAnsi16(code, 40);
ansiStyles.bgColor.ansi256 = wrapAnsi256(code, 48);
ansiStyles.bgColor.ansi16m = wrapAnsi16m(code, 48);

ansiStyles.color.ansiHex = function (hex) {
	var rgb = hexToRgb(hex);
	return ansiStyles.color.ansi16m(rgb[0], rgb[1], rgb[2]);
};

ansiStyles.color.ansi256Hex = function (hex) {
	var rgb = hexToRgb(hex);
	return ansiStyles.color.ansi256(rgbToAnsi256(rgb[0], rgb[1], rgb[2]));
};

ansiStyles.bgColor.ansiHex = function (hex) {
	var rgb = hexToRgb(hex);
	return ansiStyles.bgColor.ansi16m(rgb[0], rgb[1], rgb[2]);
};

ansiStyles.bgColor.ansi256Hex = function (hex) {
	var rgb = hexToRgb(hex);
	return ansiStyles.bgColor.ansi256(rgbToAnsi256(rgb[0], rgb[1], rgb[2]));
};

module.exports = ansiStyles;