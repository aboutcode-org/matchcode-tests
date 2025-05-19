
var processNextTick = function(fn) {
  if (typeof setImmediate === 'function') {
    setImmediate(fn);
  } else {
    setTimeout(fn, 0);
  }
};

var StringDecoder = require('string_decoder').StringDecoder;

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);
  Readable.call(this, options);
  Writable.call(this, options);
  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;
  this.once('end', onend);
}
var Readable = require('stream').Readable;
var Writable = require('stream').Writable;

function onend() {
  if (this.allowHalfOpen || this._writableState.ended) return;
  processNextTick(onEndNT, this);
}
function onEndNT(self) {
  self.end();
}

inherits(Duplex, Readable);
Object.keys(Writable.prototype).forEach(function(method) {
  if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
});

function inherits(sub, sup) {
  sub.prototype = Object.create(sup.prototype, {
    constructor: {
      value: sub,
      enumerable: false
    }
  });
}

function PassThrough(options) {
  if (!(this instanceof PassThrough))
    return new PassThrough(options);
  Transform.call(this, options);
}
inherits(PassThrough, Transform);

PassThrough.prototype._transform = function(chunk, encoding, cb) {
  cb(null, chunk);
};

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);
  Duplex.call(this, options);
  this._transformState = {
    afterTransform: afterTransform.bind(this),
    needTransform: false,
    transforming: false,
    writecb: null,
    writechunk: null,
    writeencoding: null
  };
  this._readableState.needReadable = true;
  this._readableState.sync = false;
  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;
    if (typeof options.flush === 'function') this._flush = options.flush;
  }
  this.once('prefinish', prefinish);
}

inherits(Transform, Duplex);

function afterTransform(er, data) {
  var ts = this._transformState;
  ts.transforming = false;
  var cb = ts.writecb;
  if (!cb) return this.emit('error', new Error('no writecb in Transform class'));
  ts.writechunk = null;
  ts.writecb = null;
  if (data !== null && data !== undefined) this.push(data);
  cb(er);
}

Transform.prototype._transform = function(chunk, encoding, cb) {
  cb(null, chunk);
};

Transform.prototype._write = function(chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  ts.writecb = cb;
  if (!ts.transforming) {
    if (this._readableState.needReadable || this._readableState.length < this._readableState.highWaterMark)
      this._read();
  }
};

Transform.prototype._read = function() {
  var ts = this._transformState;
  if (ts.writechunk !== null && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  }
};

Transform.prototype.push = Readable.prototype.push;

function prefinish() {
  var _this = this;
  if (typeof this._flush === 'function') {
    this._flush(function(er, data) {
      done(_this, er, data);
    });
  } else {
    done(this, null, null);
  }
}

function done(stream, er, data) {
  if (er) return stream.emit('error', er);
  if (data != null) stream.push(data);
  stream.push(null);
}

module.exports = {
  Duplex: Duplex,
  PassThrough: PassThrough,
  Transform: Transform
};