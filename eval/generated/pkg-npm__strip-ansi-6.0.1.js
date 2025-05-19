
var pattern = [
  '[\\u001B\\u009B][[\\]()#;?]*(?:',
  '(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]',
  '|(?:[\\dA-PR-TZcf-nq-uy=><~]))'
].join('|');

var ansiRegex = new RegExp(pattern, 'g');

function stripAnsi(str) {
  if (typeof str !== 'string') {
    return str;
  }
  return str.replace(ansiRegex, '');
}

module.exports = stripAnsi;