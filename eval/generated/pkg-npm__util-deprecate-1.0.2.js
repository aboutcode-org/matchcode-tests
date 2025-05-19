
var warnedMessages = {};

function deprecate(fn, message) {
    if (isNullOrUndefined(global.process)) {
        return function () {
            return deprecate(fn, message).apply(this, arguments);
        };
    }
    if (!process.noDeprecation) {
        var warned = false;
        return function () {
            if (!warned) {
                if (process.throwDeprecation) {
                    throw new Error(message);
                } else if (process.traceDeprecation) {
                    console.trace(message);
                } else {
                    if (!warnedMessages[message]) {
                        console.error(message);
                        warnedMessages[message] = true;
                    }
                }
                warned = true;
            }
            return fn.apply(this, arguments);
        };
    }
    return fn;
}

function isNullOrUndefined(x) {
    return x == null;
}

module.exports = deprecate;