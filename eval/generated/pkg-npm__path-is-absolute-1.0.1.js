function pathIsAbsolute(path) {
  if (typeof path !== 'string') return false;
  if (path.length === 0) return false;
  var code = path.charCodeAt(0);
  if (code === 47) {
    return true;
  } else if (
    (code >= 65 && code <= 90) ||
    (code >= 97 && code <= 122)
  ) {
    if (path.length > 2 &&
      path.charCodeAt(1) === 58 &&
      (path.charCodeAt(2) === 92 || path.charCodeAt(2) === 47)
    ) {
      return true;
    }
  } else if (
    path.length > 1 &&
    code === 92 &&
    path.charCodeAt(1) === 92
  ) {
    return true;
  }
  return false;
}
module.exports = pathIsAbsolute;