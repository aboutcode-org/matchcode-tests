
function traverse(schema, options) {
  options = options || {};
  var cb = options.cb || options;
  var pre = options.pre;
  var post = options.post;
  var path = [];
  var ancestors = [];

  callCB(schema, '');

  function callCB(sch, jsonPtr) {
    if (pre) {
      pre.call(options, sch, jsonPtr, path, ancestors);
    } else {
      cb.call(options, sch, jsonPtr, path, ancestors);
    }
    if (Array.isArray(sch)) return;
    if (sch && typeof sch == 'object') {
      ancestors.push(sch);
      for (var key in sch) {
        if (!Object.prototype.hasOwnProperty.call(sch, key)) continue;
        var value = sch[key];
        if (skipKeywords[key]) continue;
        path.push(key);
        callCB(value, jsonPtr + '/' + escapeJsonPtr(key));
        path.pop();
      }
      ancestors.pop();
    }
    if (post) {
      post.call(options, sch, jsonPtr, path, ancestors);
    }
  }
}

var skipKeywords = {
  default: true,
  enum: true,
  const: true,
  required: true,
  definitions: true,
  $schema: true,
  $id: true,
  $defs: true
};

function escapeJsonPtr(str) {
  return str.replace(/~/g, '~0').replace(/\//g, '~1');
}

module.exports = traverse;