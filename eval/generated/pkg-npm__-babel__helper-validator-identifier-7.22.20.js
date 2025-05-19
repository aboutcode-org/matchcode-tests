
var nonAsciiIdentifierStart = /[^\u0000-\u007F]/;
var nonAsciiIdentifier = /[^\u0000-\u007F]/;

function isIdentifierStart(ch) {
  if (ch == null) return false;
  var code = ch.charCodeAt ? ch.charCodeAt(0) : ch;
  return (
    (code >= 65 && code <= 90) ||
    (code >= 97 && code <= 122) ||
    code === 36 ||
    code === 95 ||
    (code > 0x7f && nonAsciiIdentifierStart.test(String.fromCharCode(code)))
  );
}

function isIdentifierChar(ch) {
  if (ch == null) return false;
  var code = ch.charCodeAt ? ch.charCodeAt(0) : ch;
  return (
    (code >= 65 && code <= 90) ||
    (code >= 97 && code <= 122) ||
    (code >= 48 && code <= 57) ||
    code === 36 ||
    code === 95 ||
    (code > 0x7f && nonAsciiIdentifier.test(String.fromCharCode(code)))
  );
}

var reservedWords = [
  "abstract", "await", "boolean", "break", "byte", "case", "catch", "char", "class", "const",
  "continue", "debugger", "default", "delete", "do", "double", "else", "enum", "export",
  "extends", "false", "final", "finally", "float", "for", "function", "goto", "if", "implements",
  "import", "in", "instanceof", "int", "interface", "let", "long", "native", "new", "null",
  "package", "private", "protected", "public", "return", "short", "static", "super", "switch",
  "synchronized", "this", "throw", "throws", "transient", "true", "try", "typeof", "var",
  "void", "volatile", "while", "with", "yield"
];

function isReservedWord(word) {
  return reservedWords.indexOf(word) !== -1;
}

module.exports = {
  isIdentifierStart: isIdentifierStart,
  isIdentifierChar: isIdentifierChar,
  isReservedWord: isReservedWord
};