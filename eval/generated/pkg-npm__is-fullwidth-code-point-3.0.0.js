function isFullwidthCodePoint(codePoint) {
	if (typeof codePoint !== 'number') {
		return false;
	}
	if (codePoint >= 0x1100 &&
		(
			codePoint <= 0x115F ||
			codePoint === 0x2329 ||
			codePoint === 0x232A ||
			(0x2E80 <= codePoint && codePoint <= 0xA4CF && codePoint !== 0x303F) ||
			(0xAC00 <= codePoint && codePoint <= 0xD7A3) ||
			(0xF900 <= codePoint && codePoint <= 0xFAFF) ||
			(0xFE10 <= codePoint && codePoint <= 0xFE19) ||
			(0xFE30 <= codePoint && codePoint <= 0xFE6F) ||
			(0xFF00 <= codePoint && codePoint <= 0xFF60) ||
			(0xFFE0 <= codePoint && codePoint <= 0xFFE6) ||
			(0x1B000 <= codePoint && codePoint <= 0x1B001) ||
			(0x1F200 <= codePoint && codePoint <= 0x1F251) ||
			(0x20000 <= codePoint && codePoint <= 0x3FFFD)
		)
	) {
		return true;
	}
	return false;
}
module.exports = isFullwidthCodePoint;