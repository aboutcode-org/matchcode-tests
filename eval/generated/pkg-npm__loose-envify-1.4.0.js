
var processEnv = process.env;

module.exports = function(envKey) {
  if (!envKey) return undefined;
  if (Object.prototype.hasOwnProperty.call(processEnv, envKey)) {
    return processEnv[envKey];
  }
  return undefined;
};

module.exports.looseEnvify = function(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/process\.env\.([a-zA-Z_][a-zA-Z0-9_]*)/g, function(match, p1) {
    if (Object.prototype.hasOwnProperty.call(processEnv, p1) && typeof processEnv[p1] === 'string') {
      return JSON.stringify(processEnv[p1]);
    }
    return 'undefined';
  });
};