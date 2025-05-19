
function Stream() {}
Stream.prototype.pipe = function(dest, options) {
    var source = this;
    function ondata(chunk) {
        if (dest.writable) {
            if (dest.write(chunk) === false && source.pause) {
                source.pause();
            }
        }
    }
    source.on('data', ondata);
    function ondrain() {
        if (source.readable && source.resume) {
            source.resume();
        }
    }
    dest.on('drain', ondrain);
    if (!dest._isStdio && (!options || options.end !== false)) {
        source.on('end', onend);
        source.on('close', onclose);
    }
    var didOnEnd = false;
    function onend() {
        if (didOnEnd) return;
        didOnEnd = true;
        dest.end();
    }
    function onclose() {
        if (didOnEnd) return;
        didOnEnd = true;
        if (typeof dest.destroy === 'function') dest.destroy();
    }
    function onerror(er) {
        cleanup();
        if (this.listeners('error').length === 0) {
            throw er;
        }
    }
    source.on('error', onerror);
    dest.on('error', onerror);
    function cleanup() {
        source.removeListener('data', ondata);
        dest.removeListener('drain', ondrain);
        source.removeListener('end', onend);
        source.removeListener('close', onclose);
        source.removeListener('error', onerror);
        dest.removeListener('error', onerror);
    }
    dest.on('close', cleanup);
    dest.on('finish', cleanup);

    return dest;
};

function Readable(options) {
    Stream.call(this);
    this.readable = true;
    this._readableState = {
        buffer: [],
        ended: false,
        needReadable: false
    };
}
Readable.prototype = Object.create(Stream.prototype);
Readable.prototype.constructor = Readable;
Readable.prototype.push = function(chunk) {
    var state = this._readableState;
    if (state.ended) return false;
    if (chunk === null) {
        state.ended = true;
        this.emit('end');
        return false;
    } else {
        state.buffer.push(chunk);
        this.emit('data', chunk);
        return true;
    }
};
Readable.prototype.read = function() {
    var state = this._readableState;
    return state.buffer.shift();
};

function Writable(options) {
    Stream.call(this);
    this.writable = true;
    this._writableState = {
        ended: false
    };
}
Writable.prototype = Object.create(Stream.prototype);
Writable.prototype.constructor = Writable;
Writable.prototype.write = function(chunk) {
    if (this._writableState.ended) return false;
    this.emit('write', chunk);
    return true;
};
Writable.prototype.end = function() {
    this._writableState.ended = true;
    this.emit('finish');
};

function Duplex(options) {
    Readable.call(this, options);
    Writable.call(this, options);
}
Object.setPrototypeOf(Duplex.prototype, Readable.prototype);
Object.assign(Duplex.prototype, Writable.prototype);
Duplex.prototype.constructor = Duplex;

function PassThrough(options) {
    Duplex.call(this, options);
}
PassThrough.prototype = Object.create(Duplex.prototype);
PassThrough.prototype.constructor = PassThrough;
PassThrough.prototype.write = function(chunk) {
    this.push(chunk);
    return Writable.prototype.write.call(this, chunk);
};

var EE = require('events').EventEmitter;
Object.setPrototypeOf(Stream.prototype, EE.prototype);

module.exports = {
    Stream: Stream,
    Readable: Readable,
    Writable: Writable,
    Duplex: Duplex,
    PassThrough: PassThrough
};