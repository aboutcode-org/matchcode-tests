  var emojiRanges = [
    '\uD83C[\uDDE6-\uDDFF]',
    '\uD83D[\uDC00-\uDFFF]',
    '\uD83E[\uDD00-\uDDFF]',
    '[\u2600-\u26FF]',
    '[\u2700-\u27BF]',
    '[\uFE00-\uFE0F]',
    '[\u1F900-\u1F9FF]',
    '[\u1FA70-\u1FAFF]'
  ];
  var emojiPattern = emojiRanges.join('|');
  var emojiRegex = new RegExp(emojiPattern, 'g');
  function emojiRegExp() {
    return emojiRegex;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = emojiRegExp;
  } else {
    window.emojiRegExp = emojiRegExp;
  }
})();