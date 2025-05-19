var concatMap = function(xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        var val = fn(xs[i]);
        if (Array.isArray(val)) res.push.apply(res, val);
        else res.push(val);
    }
    return res;
};

var escapeRegex = function(str) {
    return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

var balanced = function(a, b, str) {
    var ai = str.indexOf(a), bi = str.indexOf(b, ai + 1), balance = 1, i = ai;
    if (ai === -1 || bi === -1) return null;
    while (i < str.length) {
        if (str[i] === a) balance++;
        if (str[i] === b) balance--;
        if (balance === 0) return {
            start: ai,
            end: i,
            pre: str.slice(0, ai),
            body: str.slice(ai + 1, i),
            post: str.slice(i + 1)
        };
        i++;
    }
    return null;
};

var parseCommaParts = function(str) {
    if (!str) return [''];
    var parts = [];
    var m = balanced('{', '}', str);
    if (!m) return str.split(',');
    var pre = m.pre, body = m.body, post = m.post;
    var p = pre.split(',');
    p[p.length - 1] += '{' + body + '}';
    var postParts = parseCommaParts(post);
    if (post.length) {
        p[p.length - 1] += postParts.shift();
        p = p.concat(postParts);
    }
    parts = parts.concat(p);
    return parts;
};

var numeric = function(str) {
    return /^\-?\d+$/.test(str);
};

var lex = function(str) {
    var i = 0, esc = false, out = [];
    var acc = '';
    while (i < str.length) {
        var c = str[i];
        if (esc) {
            acc += c;
            esc = false;
        } else if (c === '\\') {
            esc = true;
        } else if (c === '{' || c === '}') {
            if (acc) out.push(acc), acc = '';
            out.push(c);
        } else if (c === ',') {
            if (acc) out.push(acc), acc = '';
            out.push(c);
        } else {
            acc += c;
        }
        i++;
    }
    if (acc) out.push(acc);
    return out;
};

var expand = function(str) {
    if (!str) return [''];
    var set = parseCommaParts(str);
    if (set.length === 1) {
        var m = balanced('{', '}', str);
        if (!m) return [str];
        var pre = m.pre, body = m.body, post = m.post;
        var p = expand(pre);
        var b = expand(body);
        var postExpand = expand(post);
        var result = [];
        for (var i = 0; i < p.length; i++) {
            for (var j = 0; j < b.length; j++) {
                for (var k = 0; k < postExpand.length; k++) {
                    result.push(p[i] + b[j] + postExpand[k]);
                }
            }
        }
        return result;
    } else {
        return concatMap(set, expand);
    }
};

var parseRange = function(str) {
    var m = str.match(/^(-?\d+)\.\.(-?\d+)(?:\.\.(-?\d+))?$/);
    if (!m) return [str];
    var start = parseInt(m[1], 10), end = parseInt(m[2], 10);
    var step = m[3] ? parseInt(m[3], 10) : (start < end ? 1 : -1);
    var range = [];
    if (step === 0) return [];
    if (step > 0) {
        for (var i = start; i <= end; i += step)
            range.push(String(i));
    } else {
        for (var i = start; i >= end; i += step)
            range.push(String(i));
    }
    return range;
};

var expandBrace = function(str) {
    var m = balanced('{', '}', str);
    if (!m) {
        var range = parseRange(str);
        if (range.length > 1) return range;
        return [str];
    }
    var pre = m.pre,
        body = m.body,
        post = m.post;

    var parts = parseCommaParts(body);
    var results = [];
    for (var i = 0; i < parts.length; i++) {
        var inner = expandBrace(parts[i]);
        for (var j = 0; j < inner.length; j++) {
            var expanded = pre + inner[j] + post;
            var postExpanded = expandBrace(expanded);
            for (var k = 0; k < postExpanded.length; k++) {
                results.push(postExpanded[k]);
            }
        }
    }
    return results.length ? results : [str];
};

module.exports = expandBrace;