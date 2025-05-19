
var rule = /(?:\r\n|[\n\r\u2028\u2029])|(?:\/\*[\s\S]*?\*\/|\/\/.*)|(?:'[^'\\\n\r\u2028\u2029]*')|(?:"[^"\\\n\r\u2028\u2029]*")|(?:`(?:\\[\s\S]|[^\\`])*`)|(?:0[xX][0-9a-fA-F]+|0[oO][0-7]+|0[bB][01]+|\d*\.?\d+(?:[eE][+-]?\d+)?[fFdD]?|NaN|Infinity)|(?:[A-Za-z_$][A-Za-z0-9_$]*)|(--|\+\+|==|!=|===|!==|>>>=|>>>|>>|<<|<=|>=|=>|&&|\|\||\+=|-=|\*=|\/=|%=|&=|\|=|\^=|<<=|>>=|>>>==|\.\.\.|.)/g;

function match(src) {
  rule.lastIndex = 0;
  var tokens = [];
  var m;
  while (m = rule.exec(src)) {
    tokens.push(m[0]);
  }
  return tokens;
}

module.exports = match;