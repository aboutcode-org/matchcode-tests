
var stripAnsi = function(str) {
    return typeof str === 'string' ? str.replace(
        /[\u001b\u009b][[\]()#;?]*((?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><])?/g, ''
    ) : '';
};

var isFullwidthCodePoint = function(code) {
    if (code >= 0x1100 &&
        (code <= 0x115f ||
            code === 0x2329 ||
            code === 0x232a ||
            (0x2e80 <= code && code <= 0xa4cf && code !== 0x303f) ||
            (0xac00 <= code && code <= 0xd7a3) ||
            (0xf900 <= code && code <= 0xfaff) ||
            (0xfe10 <= code && code <= 0xfe19) ||
            (0xfe30 <= code && code <= 0xfe6f) ||
            (0xff00 <= code && code <= 0xff60) ||
            (0xffe0 <= code && code <= 0xffe6) ||
            (0x1b000 <= code && code <= 0x1b001) ||
            (0x1f200 <= code && code <= 0x1f251) ||
            (0x20000 <= code && code <= 0x3fffd))) {
        return true;
    }
    return false;
};

var stringWidth = function(str) {
    if (typeof str !== 'string' || str.length === 0) {
        return 0;
    }
    str = stripAnsi(str);
    var width = 0;
    for (var i = 0; i < str.length; i++) {
        var code = str.codePointAt(i);
        if (code > 0xffff) {
            i++;
        }
        if (code === 0) {
            continue;
        }
        if (code < 32 || (code >= 0x7f && code < 0xa0)) {
            continue;
        }
        if (isFullwidthCodePoint(code)) {
            width += 2;
        } else {
            width += 1;
        }
    }
    return width;
};

module.exports = stringWidth;