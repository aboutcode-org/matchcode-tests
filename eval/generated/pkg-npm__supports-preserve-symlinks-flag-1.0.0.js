
var semver = require('semver');
var execSync = require('child_process').execSync;

function nodeSupportsPreserveSymlinksFlag() {
  if (typeof process === 'undefined') return false;

  var version = process.version;
  if (!semver.valid(version)) return false;
  if (semver.lt(version, '6.2.0')) return false;

  try {
    var output = execSync(process.execPath + ' --preserve-symlinks -e "console.log(true)"', {stdio: ['pipe', 'pipe', 'ignore']});
    if (output) {
      return String(output).trim() === 'true';
    }
  } catch (e) {}
  return false;
}

module.exports = nodeSupportsPreserveSymlinksFlag;