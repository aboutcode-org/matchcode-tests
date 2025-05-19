module.exports = function(a, b, str) {
  if (!a || !b || !str) return;
  var ai = str.indexOf(a);
  var bi = str.indexOf(b, ai + 1);
  if (ai < 0 || bi < 0) return;
  var i = ai, count = 0, matchStart = -1, matchEnd = -1;
  while (i < str.length) {
    if (str.substr(i, a.length) === a) {
      if (count === 0) matchStart = i;
      count++;
      i += a.length;
      continue;
    }
    if (str.substr(i, b.length) === b) {
      count--;
      if (count === 0) {
        matchEnd = i;
        break;
      }
      i += b.length;
      continue;
    }
    i++;
  }
  if (count !== 0 || matchStart < 0 || matchEnd < 0) return;
  return {
    start: matchStart,
    end: matchEnd,
    pre: str.slice(0, matchStart),
    body: str.slice(matchStart + a.length, matchEnd),
    post: str.slice(matchEnd + b.length)
  };
};