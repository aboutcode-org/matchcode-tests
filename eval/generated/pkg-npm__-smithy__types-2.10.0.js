
var __assign = function (target) {
    for (var i = 1; i < arguments.length; i++) {
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
};

var HttpMethod;
(function(HttpMethod) {
    HttpMethod["GET"] = "GET";
    HttpMethod["POST"] = "POST";
    HttpMethod["PUT"] = "PUT";
    HttpMethod["DELETE"] = "DELETE";
    HttpMethod["PATCH"] = "PATCH";
    HttpMethod["HEAD"] = "HEAD";
    HttpMethod["OPTIONS"] = "OPTIONS";
})(HttpMethod = exports.HttpMethod || (exports.HttpMethod = {}));

var RetryStrategy;
(function(RetryStrategy) {
    RetryStrategy["STANDARD"] = "standard";
    RetryStrategy["ADAPTIVE"] = "adaptive";
    RetryStrategy["NO_RETRY"] = "no-retry";
})(RetryStrategy = exports.RetryStrategy || (exports.RetryStrategy = {}));

function isAbortSignal(signal) {
    return typeof signal === "object" && (!!signal.aborted || typeof signal.aborted === "boolean");
}

function isHttpRequest(obj) {
    return obj && typeof obj.protocol === "string" && typeof obj.method === "string";
}

function isHttpResponse(obj) {
    return obj && typeof obj.statusCode === "number" && typeof obj.body !== "undefined";
}

function isProvider(obj) {
    return typeof obj === "function";
}

function getErrorCode(error) {
    if (error == null) return undefined;
    if (typeof error.code === "string") return error.code;
    if (typeof error.name === "string") return error.name;
    return undefined;
}

exports.HttpMethod = HttpMethod;
exports.RetryStrategy = RetryStrategy;
exports.isAbortSignal = isAbortSignal;
exports.isHttpRequest = isHttpRequest;
exports.isHttpResponse = isHttpResponse;
exports.isProvider = isProvider;
exports.getErrorCode = getErrorCode;
exports.__assign = __assign;