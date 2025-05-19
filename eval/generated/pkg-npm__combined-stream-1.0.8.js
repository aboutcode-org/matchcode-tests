var util = require('util');
var stream = require('stream');

function CombinedStream() {
    this.streams = [];
    this.currentStream = null;
    this.readable = true;
    this.writable = false;
    this.paused = false;
    this.destroyed = false;
    stream.Stream.call(this);
}

util.inherits(CombinedStream, stream.Stream);

CombinedStream.prototype.append = function(streamOrData) {
    this.streams.push(streamOrData);
    return this;
};

CombinedStream.prototype._getNext = function() {
    if (this.streams.length === 0) {
        this.emit('end');
        return;
    }
    var item = this.streams.shift();
    process.nextTick(this._pipeNext.bind(this, item));
};

CombinedStream.prototype._pipeNext = function(item) {
    if (this.destroyed) return;
    if (typeof item === 'function') {
        item = item();
    }

    if (typeof item === 'string' || Buffer.isBuffer(item)) {
        this.emit('data', item);
        return this._getNext();
    }

    this.currentStream = item;
    var self = this;
    item.on('data', function(chunk) {
        self.emit('data', chunk);
    });
    item.on('end', function() {
        self.currentStream = null;
        self._getNext();
    });
    item.on('error', function(err) {
        self.emit('error', err);
    });

    if (this.paused) {
        item.pause();
    }
};

CombinedStream.prototype.resume = function() {
    this.paused = false;
    if (this.currentStream && this.currentStream.resume) {
        this.currentStream.resume();
    } else if (!this.currentStream) {
        this._getNext();
    }
};

CombinedStream.prototype.pause = function() {
    this.paused = true;
    if (this.currentStream && this.currentStream.pause) {
        this.currentStream.pause();
    }
};

CombinedStream.prototype.destroy = function() {
    this.destroyed = true;
    this.streams = [];
    if (this.currentStream && this.currentStream.destroy) {
        this.currentStream.destroy();
    }
    this.emit('close');
};

module.exports = CombinedStream;