
function extend() {
    var target = arguments[0] || {};
    var i = 1;
    var length = arguments.length;

    for (; i < length; i++) {
        var source = arguments[i];
        if (source != null) {
            for (var key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }
    }
    return target;
}

module.exports = extend;