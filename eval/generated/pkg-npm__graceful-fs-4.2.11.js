var fs = require('fs');
var origOpen = fs.open;
var origClose = fs.close;
var origRead = fs.read;
var origWrite = fs.write;
var queue = [];
var isOpenFileLimitReached = false;
var constants = require('constants');
var hasQueueProcessing = false;
function enqueue(fn, args, cb) {
  queue.push({ fn: fn, args: args, cb: cb });
  processQueue();
}
function processQueue() {
  if (hasQueueProcessing) return;
  hasQueueProcessing = true;
  setImmediate(function handle() {
    if (queue.length === 0) {
      hasQueueProcessing = false;
      return;
    }
    var task = queue.shift();
    task.fn.apply(null, task.args.concat(function() {
      var err = arguments[0];
      if (err && err.code === 'EMFILE') {
        isOpenFileLimitReached = true;
        queue.unshift(task);
        setTimeout(handle, 100);
      } else {
        isOpenFileLimitReached = false;
        if (typeof task.cb === 'function') task.cb.apply(null, arguments);
        setImmediate(handle);
      }
    }));
  });
}
fs.open = function(path, flags, mode, callback) {
  if (typeof mode === 'function') {
    callback = mode;
    mode = undefined;
  }
  function openCb(err, fd) {
    if (err && err.code === 'EMFILE') {
      enqueue(fs.open, [path, flags, mode], callback);
    } else {
      if (typeof callback === 'function') callback.apply(null, arguments);
    }
  }
  origOpen.call(fs, path, flags, mode, openCb);
};
fs.close = function(fd, callback) {
  origClose.call(fs, fd, function() {
    if (isOpenFileLimitReached) processQueue();
    if (typeof callback === 'function') callback.apply(null, arguments);
  });
};
fs.read = function(fd, buffer, offset, length, position, callback) {
  origRead.call(fs, fd, buffer, offset, length, position, callback);
};
fs.write = function(fd, buffer, offset, length, position, callback) {
  origWrite.call(fs, fd, buffer, offset, length, position, callback);
};
for (var key in fs) {
  if (!fs.hasOwnProperty(key)) continue;
  if (typeof fs[key] === 'function' && !module.exports[key]) {
    module.exports[key] = fs[key];
  }
}
module.exports = fs;