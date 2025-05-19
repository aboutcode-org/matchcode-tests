var buffer = require('buffer');
var Buffer = buffer.Buffer;

function SafeBuffer(arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length);
}

Object.setPrototypeOf(SafeBuffer, Buffer);

SafeBuffer.prototype = Object.create(Buffer.prototype);

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number');
  }
  return Buffer(arg, encodingOrOffset, length);
};

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Size must be a number');
  }
  var b = Buffer(size);
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      b.fill(fill, encoding);
    } else {
      b.fill(fill);
    }
  } else {
    b.fill(0);
  }
  return b;
};

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Size must be a number');
  }
  return Buffer(size);
};

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Size must be a number');
  }
  return buffer.SlowBuffer(size);
};

module.exports = SafeBuffer;