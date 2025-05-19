
function SaferBuffer(lengthOrArray, encoding) {
    if (typeof lengthOrArray === 'number') {
        return Buffer.alloc(lengthOrArray);
    } else if (typeof lengthOrArray === 'string') {
        return Buffer.from(lengthOrArray, encoding);
    } else if (Array.isArray(lengthOrArray) || ArrayBuffer.isView(lengthOrArray) || lengthOrArray instanceof ArrayBuffer) {
        return Buffer.from(lengthOrArray);
    } else if (lengthOrArray instanceof Buffer) {
        return Buffer.from(lengthOrArray);
    } else {
        throw new TypeError('Invalid argument type for SaferBuffer');
    }
}

SaferBuffer.alloc = function alloc(size, fill, encoding) {
    return Buffer.alloc(size, fill, encoding);
};

SaferBuffer.from = function from(value, encodingOrOffset, length) {
    if (typeof value === 'number') {
        throw new TypeError('The "value" argument must not be of type number.');
    }
    if (typeof encodingOrOffset === 'string') {
        return Buffer.from(value, encodingOrOffset);
    }
    if (typeof length === 'number') {
        return Buffer.from(value, encodingOrOffset, length);
    }
    return Buffer.from(value);
};

SaferBuffer.allocUnsafe = function allocUnsafe(size) {
    return Buffer.allocUnsafe(size);
};

SaferBuffer.allocUnsafeSlow = function allocUnsafeSlow(size) {
    return Buffer.allocUnsafeSlow(size);
};

module.exports = SaferBuffer;