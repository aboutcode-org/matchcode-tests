
function StringDecoder(encoding) {
    if (!(this instanceof StringDecoder)) return new StringDecoder(encoding);
    this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/g, '');
    switch (this.encoding) {
        case 'utf8':
        case 'utf-8':
            this.surrogateSize = 3;
            break;
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
            this.surrogateSize = 2;
            break;
        case 'base64':
            this.surrogateSize = 3;
            break;
        default:
            this.write = function(buf) {
                return buf.toString(this.encoding);
            };
            return;
    }
    this.charBuffer = new Buffer.allocUnsafe(6);
    this.charReceived = 0;
    this.charLength = 0;
}

StringDecoder.prototype.write = function(buffer) {
    var charStr = '';
    var buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
    while (this.charLength) {
        var available = (buf.length >= this.charLength - this.charReceived) ? this.charLength - this.charReceived : buf.length;
        buf.copy(this.charBuffer, this.charReceived, 0, available);
        this.charReceived += available;
        if (this.charReceived < this.charLength) {
            return '';
        }
        charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);
        var charCode = charStr.charCodeAt(charStr.length - 1);
        if (charCode >= 0xD800 && charCode <= 0xDBFF) {
            this.charLength += this.surrogateSize;
            charStr = '';
            continue;
        }
        this.charReceived = this.charLength = 0;
        if (buf.length === available) {
            return charStr;
        }
        buf = buf.slice(available, buf.length);
        break;
    }
    var lenIncomplete = this.detectIncompleteChar(buf);
    var end = buf.length;
    if (this.charLength) {
        buf.copy(this.charBuffer, 0, buf.length - lenIncomplete, buf.length);
        this.charReceived = lenIncomplete;
        end -= lenIncomplete;
    }
    charStr += buf.toString(this.encoding, 0, end);
    var lastChar = charStr.length - 1;
    if (lastChar >= 0) {
        var code = charStr.charCodeAt(lastChar);
        if (code >= 0xD800 && code <= 0xDBFF) {
            this.charLength = this.surrogateSize;
            this.charReceived = 0;
            this.charBuffer.write(charStr.charAt(lastChar), 0, this.surrogateSize, this.encoding);
            return charStr.slice(0, lastChar);
        }
    }
    return charStr;
};

StringDecoder.prototype.end = function(buffer) {
    var res = '';
    if (buffer && buffer.length)
        res = this.write(buffer);
    if (this.charReceived) {
        res += this.charBuffer.slice(0, this.charReceived).toString(this.encoding);
    }
    return res;
};

StringDecoder.prototype.detectIncompleteChar = function(buffer) {
    var i = (buffer.length >= 3) ? 3 : buffer.length;
    for (; i > 0; i--) {
        var c = buffer[buffer.length - i];
        if (this.surrogateSize === 2) {
            if (i === 1 && c >> 6 === 0x01) {
                this.charLength = 2;
                break;
            }
        } else if (this.surrogateSize === 3) {
            if (i === 1 && c >> 5 === 0x06) {
                this.charLength = 2;
                break;
            }
            if (i <= 2 && c >> 4 === 0x0E) {
                this.charLength = 3;
                break;
            }
            if (i <= 3 && c >> 3 === 0x1E) {
                this.charLength = 4;
                break;
            }
        }
    }
    this.charReceived = i;
    return i;
};

module.exports = {
    StringDecoder: StringDecoder
};