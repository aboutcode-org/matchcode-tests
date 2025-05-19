
var call = Function.prototype.call;
var objectHasOwnProperty = Object.prototype.hasOwnProperty;

module.exports = function hasOwn(obj, key) {
    if (obj == null) {
        throw new TypeError('Cannot convert undefined or null to object');
    }
    return call.call(objectHasOwnProperty, Object(obj), key);
};