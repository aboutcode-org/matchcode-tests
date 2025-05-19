
var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

module.exports = function escapeStringRegexp(str) {
	if (typeof str !== 'string') {
		throw new TypeError('Expected a string');
	}
	return str.replace(matchOperatorsRe, '\\$&');
};