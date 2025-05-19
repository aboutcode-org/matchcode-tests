var coreModules = [
  'assert',
  'async_hooks',
  'buffer',
  'child_process',
  'cluster',
  'console',
  'constants',
  'crypto',
  'dgram',
  'dns',
  'domain',
  'events',
  'fs',
  'http',
  'http2',
  'https',
  'inspector',
  'module',
  'net',
  'os',
  'path',
  'perf_hooks',
  'process',
  'punycode',
  'querystring',
  'readline',
  'repl',
  'stream',
  'string_decoder',
  'sys',
  'timers',
  'tls',
  'trace_events',
  'tty',
  'url',
  'util',
  'v8',
  'vm',
  'wasi',
  'worker_threads',
  'zlib'
];

var coreModulesMap = {};
for (var i = 0; i < coreModules.length; i++) {
  coreModulesMap[coreModules[i]] = true;
}

function isCoreModule(name) {
  if (typeof name !== 'string') return false;
  var base = name.split('/')[0];
  return !!coreModulesMap[base];
}

module.exports = isCoreModule;