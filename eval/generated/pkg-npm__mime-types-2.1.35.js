'use strict';

var db = {
  "html": "text/html",
  "txt": "text/plain",
  "json": "application/json",
  "js": "application/javascript",
  "css": "text/css",
  "jpg": "image/jpeg",
  "jpeg": "image/jpeg",
  "png": "image/png",
  "gif": "image/gif",
  "svg": "image/svg+xml",
  "pdf": "application/pdf",
  "xml": "application/xml",
  "zip": "application/zip",
  "mp3": "audio/mpeg",
  "mp4": "video/mp4",
  "csv": "text/csv"
};

var extMap = {};
Object.keys(db).forEach(function(ext) {
  var type = db[ext];
  if (!extMap[type]) extMap[type] = [];
  extMap[type].push(ext);
});

function lookup(path) {
  var ext = String(path).replace(/^.*\./, '').toLowerCase();
  return db[ext] || false;
}

function contentType(str) {
  var mime = lookup(str) || str;
  if (!/^[\w.-]+\/[\w.+-]+$/.test(mime)) return false;
  if (/^text\//.test(mime) && !/; *charset=/.test(mime)) mime += '; charset=utf-8';
  return mime;
}

function extension(type) {
  type = type.toLowerCase().split(';')[0].trim();
  if (!extMap[type]) return false;
  return extMap[type][0];
}

module.exports = {
  lookup: lookup,
  contentType: contentType,
  extension: extension,
  types: db
};