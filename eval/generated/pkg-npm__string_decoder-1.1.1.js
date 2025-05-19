'use strict';

function assertEncoding(encoding) {
    switch ((encoding + '').toLowerCase()) {
        case 'utf8':
        case 'utf-8':
        case 'utf16le':
        case 'ucs2':
        case 'ucs-2':
        case 'base64':
        case 'latin1':
        case 'binary':
        case 'hex':
        case 'ascii':
        case undefined:
            return;
        default:
            throw new Error('Unknown encoding: ' + encoding);
    }
}

function normalizeEncoding(enc) {
    if (!enc) return 'utf8';
    var encStr = (enc + '').toLowerCase();
    if (encStr === 'utf8' || encStr === 'utf-8') return 'utf8';
    if (encStr === 'ucs2' || encStr === 'ucs-2') return 'utf16le';
    if (encStr === 'latin1' || encStr === 'binary') return 'latin1';
    return encStr;
}

function StringDecoder(encoding) {
    this.encoding = normalizeEncoding(encoding);
    switch (this.encoding) {
        case 'utf16le':
            this.surrogateSize = 2;
            break;
        case 'utf8':
            this.surrogateSize = 3;
            break;
        default:
            this.surrogateSize = 0;
    }
    this.buffer = [];
    this.buffered = 0;
    this.charBuffer = '';
}

StringDecoder.prototype.write = function(buffer) {
    if (!Buffer.isBuffer(buffer)) buffer = Buffer.from(buffer, 'utf8');
    switch (this.encoding) {
        case 'utf8':
            return this._writeUtf8(buffer);
        case 'utf16le':
            return this._writeUtf16le(buffer);
        case 'base64':
            return this._writeBase64(buffer);
        default:
            return buffer.toString(this.encoding);
    }
};

StringDecoder.prototype.end = function(buffer) {
    var res = '';
    if (buffer && buffer.length) res = this.write(buffer);
    if (this.charBuffer) {
        res += this.charBuffer;
        this.charBuffer = '';
    }
    return res;
};

StringDecoder.prototype._writeUtf8 = function(buffer) {
    var charStr = '';
    var i = 0;
    var len = buffer.length;
    while (i < len) {
        var byte = buffer[i];
        var nb = 0;
        if (byte >> 5 === 0x06) nb = 2;
        else if (byte >> 4 === 0x0e) nb = 3;
        else if (byte >> 3 === 0x1e) nb = 4;
        else nb = 1;
        if (i + nb > len) break;
        charStr += buffer.slice(i, i + nb).toString('utf8');
        i += nb;
    }
    if (i < len) {
        this.charBuffer = buffer.slice(i).toString('binary');
    } else {
        this.charBuffer = '';
    }
    return charStr;
};

StringDecoder.prototype._writeUtf16le = function(buffer) {
    var rem = buffer.length % 2;
    var str = buffer.toString('utf16le', 0, buffer.length - rem);
    if (rem) {
        this.charBuffer = buffer.toString('binary', buffer.length - rem);
    } else {
        this.charBuffer = '';
    }
    return str;
};

StringDecoder.prototype._writeBase64 = function(buffer) {
    var rem = buffer.length % 3;
    var str = buffer.toString('base64', 0, buffer.length - rem);
    if (rem) {
        this.charBuffer = buffer.toString('binary', buffer.length - rem);
    } else {
        this.charBuffer = '';
    }
    return str;
};

module.exports.StringDecoder = StringDecoder;