  'use strict';
  var HEX = /[A-Fa-f0-9]{2}/g;
  function decodeURIComponentSimple(str) {
    return str.replace(/%([A-Fa-f0-9]{2})/g, function(_, hex) {
      return String.fromCharCode(parseInt(hex, 16));
    });
  }
  function encodeURIComponentSimple(str) {
    return String(str).replace(/[^A-Za-z0-9_.~\-]/g, function(c) {
      var hex = c.charCodeAt(0).toString(16).toUpperCase();
      return '%' + (hex.length < 2 ? '0' : '') + hex;
    });
  }
  function parse(uri) {
    var m = /^([A-Za-z][A-Za-z0-9+.-]*):(?:\/\/([^\/?#]*))?([^?#]*)(\?[^#]*)?(#.*)?$/.exec(uri);
    if (!m) return null;
    var auth = m[2] || '', path = m[3] || '', query = m[4] || '', hash = m[5] || '';
    var userinfo = '', host = '', port = null;
    if (auth) {
      var authPart = /^(([^@]+)@)?([\[\]A-Za-z0-9.\-:]+)(?::([0-9]+))?$/.exec(auth);
      if (authPart) {
        userinfo = authPart[2] || '';
        host = authPart[3] || '';
        if (authPart[4]) port = parseInt(authPart[4], 10);
      }
    }
    return {
      scheme: m[1],
      userinfo: userinfo,
      host: host,
      port: port,
      path: path,
      query: query ? query.substring(1) : '',
      fragment: hash ? hash.substring(1) : ''
    };
  }
  function serialize(components) {
    var out = '';
    if (components.scheme) out += components.scheme + ':';
    if (components.host) {
      out += '//';
      if (components.userinfo) out += components.userinfo + '@';
      out += components.host;
      if (typeof components.port === 'number') out += ':' + components.port;
    }
    if (components.path) out += components.path;
    if (components.query) out += '?' + components.query;
    if (components.fragment) out += '#' + components.fragment;
    return out;
  }
  var uriJS = {
    parse: parse,
    serialize: serialize,
    escapeComponent: encodeURIComponentSimple,
    unescapeComponent: decodeURIComponentSimple
  };
  if (typeof exports === 'object' && typeof module === 'object') {
    module.exports = uriJS;
  } else if (typeof define === 'function' && define.amd) {
    define(function() { return uriJS; });
  } else {
    root.URI_JS = uriJS;
  }
})(this);