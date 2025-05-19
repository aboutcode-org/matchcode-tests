var revLookup = [];
var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i];
  revLookup[code.charCodeAt(i)] = i;
}
revLookup["-".charCodeAt(0)] = 62;
revLookup["_".charCodeAt(0)] = 63;

function getLens(b64) {
  var len = b64.length;
  if (len % 4 > 0) {
    throw new Error("Invalid string. Length must be a multiple of 4");
  }
  var validLen = b64.indexOf("=");
  if (validLen === -1) validLen = len;
  var placeHoldersLen = validLen === len ? 0 : 4 - (validLen % 4);
  return [validLen, placeHoldersLen];
}

function b64ToByteArray(b64) {
  var lens = getLens(b64);
  var validLen = lens[0], placeHoldersLen = lens[1];
  var arrLen = ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen;
  var arr = new Arr(arrLen);
  var curByte = 0;
  var i, tmp;
  var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
  for (i = 0; i < len2; i += 4) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)];
    arr[curByte++] = (tmp >> 16) & 0xFF;
    arr[curByte++] = (tmp >> 8) & 0xFF;
    arr[curByte++] = tmp & 0xFF;
  }
  if (placeHoldersLen === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4);
    arr[curByte++] = tmp & 0xFF;
  }
  if (placeHoldersLen === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2);
    arr[curByte++] = (tmp >> 8) & 0xFF;
    arr[curByte++] = tmp & 0xFF;
  }
  return arr;
}

function tripletToBase64(num) {
  return lookup[(num >> 18) & 0x3F] +
    lookup[(num >> 12) & 0x3F] +
    lookup[(num >> 6) & 0x3F] +
    lookup[num & 0x3F];
}

function encodeChunk(uint8, start, end) {
  var output = [];
  for (var i = start; i < end; i += 3) {
    output.push(tripletToBase64(
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    ));
  }
  return output.join('');
}

function fromByteArray(uint8) {
  var tmp;
  var len = uint8.length;
  var extraBytes = len % 3;
  var ret = '';
  var parts = [];
  var maxChunkLength = 16383;
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, Math.min(i + maxChunkLength, len2)));
  }
  if (extraBytes === 1) {
    tmp = uint8[len - 1];
    ret += lookup[tmp >> 2];
    ret += lookup[(tmp << 4) & 0x3F];
    ret += "==";
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1];
    ret += lookup[tmp >> 10];
    ret += lookup[(tmp >> 4) & 0x3F];
    ret += lookup[(tmp << 2) & 0x3F];
    ret += "=";
  }
  parts.push(ret);
  return parts.join('');
}