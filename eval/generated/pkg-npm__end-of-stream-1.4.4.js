
function once(callback) {
  var called = false;
  return function() {
    if (called) return;
    called = true;
    callback.apply(this, arguments);
  };
}

function isRequest(stream) {
  return stream.setHeader && typeof stream.abort === 'function';
}

function eos(stream, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }
  if (!opts) opts = {};
  callback = once(callback || function() {});

  var readable = opts.readable || (opts.readable !== false && stream.readable);
  var writable = opts.writable || (opts.writable !== false && stream.writable);

  var onlegacyfinish = function() {
    if (!stream.writable) onfinish();
  };

  var onfinish = function() {
    writable = false;
    if (!readable) callback.call(stream);
  };

  var onend = function() {
    readable = false;
    if (!writable) callback.call(stream);
  };

  var onclose = function() {
    if (readable && !(stream._readableState && stream._readableState.ended)) return callback.call(stream, new Error('premature close'));
    if (writable && !(stream._writableState && stream._writableState.finished)) return callback.call(stream, new Error('premature close'));
  };

  var onerror = function(err) {
    callback.call(stream, err);
  };

  stream.on('end', onend);
  stream.on('finish', onfinish);
  if ('closed' in stream) {
    stream.on('close', onclose);
  } else {
    stream.on('close', onclose);
  }
  stream.on('error', onerror);

  if (!readable) process.nextTick(onend);
  if (!writable) process.nextTick(onfinish);

  return function() {
    stream.removeListener('end', onend);
    stream.removeListener('finish', onfinish);
    stream.removeListener('close', onclose);
    stream.removeListener('error', onerror);
  };
}

module.exports = eos;