var processExited = false;
var signals = [
  'SIGINT',
  'SIGTERM',
  'SIGHUP',
  'SIGQUIT',
  'SIGUSR1',
  'SIGUSR2',
  'SIGBREAK'
];
var listeners = [];
var exitListeners = [];
function onExit(cb, opts) {
  if (typeof cb !== 'function') return;
  var called = false;
  function handler(code, signal) {
    if (called) return;
    called = true;
    cb(code, signal);
  }
  exitListeners.push(handler);
  attach();
  return function () {
    var idx = exitListeners.indexOf(handler);
    if (idx !== -1) exitListeners.splice(idx, 1);
  };
}
function attach() {
  if (processExited) return;
  if (listeners.length) return;
  process.once('exit', exitHandler);
  signals.forEach(function (sig) {
    try {
      process.on(sig, signalHandler.bind(null, sig));
      listeners.push(sig);
    } catch (e) {}
  });
}
function exitHandler(code) {
  if (processExited) return;
  processExited = true;
  exitListeners.forEach(function (fn) {
    fn(code);
  });
}
function signalHandler(signal) {
  exitHandler(128 + (typeof signal === 'string' ? signals.indexOf(signal) : 0));
  process.exit(128 + (typeof signal === 'string' ? signals.indexOf(signal) : 0));
}
module.exports = onExit;