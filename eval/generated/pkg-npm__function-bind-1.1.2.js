var implementation = function bind(that) {
    var target = this;
    var args = Array.prototype.slice.call(arguments, 1);
    var bound;
    if (typeof target !== 'function') {
        throw new TypeError('Function.prototype.bind called on incompatible ' + target);
    }
    bound = function() {
        var finalArgs = args.concat(Array.prototype.slice.call(arguments));
        if (this instanceof bound) {
            var result = target.apply(this, finalArgs);
            if (Object(result) === result) {
                return result;
            }
            return this;
        } else {
            return target.apply(that, finalArgs);
        }
    };
    if (target.prototype) {
        function Empty() {}
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }
    return bound;
};

module.exports = Function.prototype.bind || implementation;