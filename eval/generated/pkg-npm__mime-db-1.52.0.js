  var db = {
    "application/json": {
      source: "iana",
      compressible: true,
      extensions: [
        "json",
        "map"
      ]
    },
    "text/plain": {
      source: "iana",
      compressible: true,
      extensions: [
        "txt",
        "text",
        "conf",
        "def",
        "list",
        "log",
        "in",
        "ini"
      ]
    },
    "text/html": {
      source: "iana",
      compressible: true,
      extensions: [
        "html",
        "htm",
        "shtml"
      ]
    },
    "application/javascript": {
      source: "iana",
      compressible: true,
      extensions: [
        "js",
        "mjs"
      ]
    },
    "image/jpeg": {
      source: "iana",
      compressible: false,
      extensions: [
        "jpeg",
        "jpg",
        "jpe"
      ]
    },
    "image/png": {
      source: "iana",
      compressible: false,
      extensions: [
        "png"
      ]
    },
    "application/octet-stream": {
      source: "iana",
      compressible: false,
      extensions: [
        "bin",
        "dms",
        "lrf",
        "mar",
        "so",
        "dist",
        "distz",
        "pkg",
        "bpk",
        "dump",
        "elc",
        "deploy"
      ]
    }
  };

  function extensions(type) {
    var obj = db[type.toLowerCase()];
    if(!obj || !obj.extensions) return [];
    return obj.extensions.slice();
  }

  function lookup(ext) {
    ext = ext.replace(/^\./, '').toLowerCase();
    for(var type in db) {
      if(db[type].extensions && db[type].extensions.indexOf(ext) !== -1) {
        return type;
      }
    }
    return false;
  }

  function types() {
    var arr = [];
    for(var type in db) {
      arr.push(type);
    }
    return arr;
  }

  function charset(type) {
    type = type.split(';')[0].trim().toLowerCase();
    if(type.slice(0,5) === "text/") return "UTF-8";
    if(type === "application/json" || type === "application/javascript") return "UTF-8";
    return undefined;
  }

  var mimeDB = {
    db: db,
    extensions: extensions,
    lookup: lookup,
    types: types,
    charset: charset
  };

  if(typeof exports === "object") {
    module.exports = mimeDB;
  } else {
    root.mimeDB = mimeDB;
  }
})(this);