
function DelayedStream(source, options) {
  if (!(this instanceof DelayedStream))
    return new DelayedStream(source, options);
  this.source = source;
  this.paused = false;
  this.readable = true;
  this.writable = false;
  this.dataQueue = [];
  this.pipeDestinations = [];
  this._events = {};
  if (source) {
    var self = this;
    source.on('data', function(data) {
      self.dataQueue.push(data);
      self.emit('data', data);
    });
    source.on('end', function() {
      self.readable = false;
      self.emit('end');
    });
    source.on('close', function() {
      self.emit('close');
    });
    source.on('error', function(err) {
      self.emit('error', err);
    });
  }
}

DelayedStream.prototype.on = function(event, listener) {
  if (!this._events[event]) this._events[event] = [];
  this._events[event].push(listener);
  return this;
};

DelayedStream.prototype.emit = function(event) {
  var args = Array.prototype.slice.call(arguments, 1);
  var listeners = this._events[event];
  if (!listeners) return false;
  for (var i = 0; i < listeners.length; ++i) {
    listeners[i].apply(this, args);
  }
  return true;
};

DelayedStream.prototype.pause = function() {
  this.paused = true;
  if (this.source && this.source.pause) this.source.pause();
};

DelayedStream.prototype.resume = function() {
  this.paused = false;
  if (this.source && this.source.resume) this.source.resume();
  while (this.dataQueue.length && !this.paused) {
    var data = this.dataQueue.shift();
    this.emit('data', data);
  }
};

DelayedStream.prototype.pipe = function(dest) {
  var self = this;
  this.on('data', function(data) {
    dest.write(data);
  });
  this.on('end', function() {
    dest.end();
  });
  this.pipeDestinations.push(dest);
  return dest;
};

module.exports = DelayedStream;