
var hasSymbol = typeof Symbol === 'function' && Symbol.for;

var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7;
var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for('react.portal') : 0xeaca;
var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for('react.fragment') : 0xeacb;
var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for('react.strict_mode') : 0xeacc;
var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for('react.profiler') : 0xead2;
var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for('react.provider') : 0xeacd;
var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for('react.context') : 0xeace;
var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol.for('react.async_mode') : 0xeacf;
var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for('react.concurrent_mode') : 0xeacf;
var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;
var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for('react.suspense') : 0xead1;
var REACT_MEMO_TYPE = hasSymbol ? Symbol.for('react.memo') : 0xead3;
var REACT_LAZY_TYPE = hasSymbol ? Symbol.for('react.lazy') : 0xead4;

function isValidElementType(type) {
  return typeof type === 'string' || typeof type === 'function' ||
    type === REACT_FRAGMENT_TYPE ||
    type === REACT_CONCURRENT_MODE_TYPE ||
    type === REACT_PROFILER_TYPE ||
    type === REACT_STRICT_MODE_TYPE ||
    type === REACT_SUSPENSE_TYPE ||
    typeof type === 'object' && type !== null &&
      (type.$$typeof === REACT_LAZY_TYPE ||
       type.$$typeof === REACT_MEMO_TYPE ||
       type.$$typeof === REACT_PROVIDER_TYPE ||
       type.$$typeof === REACT_CONTEXT_TYPE ||
       type.$$typeof === REACT_FORWARD_REF_TYPE);
}

function typeOf(object) {
  if (typeof object === 'object' && object !== null) {
    var $$typeof = object.$$typeof;
    switch ($$typeof) {
      case REACT_ELEMENT_TYPE:
        var type = object.type;
        switch (type) {
          case REACT_FRAGMENT_TYPE:
          case REACT_CONCURRENT_MODE_TYPE:
          case REACT_PROFILER_TYPE:
          case REACT_STRICT_MODE_TYPE:
          case REACT_SUSPENSE_TYPE:
            return type;
          default:
            var $$typeofType = type && type.$$typeof;
            switch ($$typeofType) {
              case REACT_CONTEXT_TYPE:
              case REACT_FORWARD_REF_TYPE:
              case REACT_PROVIDER_TYPE:
              case REACT_MEMO_TYPE:
              case REACT_LAZY_TYPE:
                return $$typeofType;
              default:
                return REACT_ELEMENT_TYPE;
            }
        }
      case REACT_PORTAL_TYPE:
        return REACT_PORTAL_TYPE;
    }
  }
  return undefined;
}

var exports = {};

exports.typeOf = typeOf;
exports.isValidElementType = isValidElementType;
exports.AsyncMode = REACT_ASYNC_MODE_TYPE;
exports.ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
exports.ContextConsumer = REACT_CONTEXT_TYPE;
exports.ContextProvider = REACT_PROVIDER_TYPE;
exports.Element = REACT_ELEMENT_TYPE;
exports.ForwardRef = REACT_FORWARD_REF_TYPE;
exports.Fragment = REACT_FRAGMENT_TYPE;
exports.Lazy = REACT_LAZY_TYPE;
exports.Memo = REACT_MEMO_TYPE;
exports.Portal = REACT_PORTAL_TYPE;
exports.Profiler = REACT_PROFILER_TYPE;
exports.StrictMode = REACT_STRICT_MODE_TYPE;
exports.Suspense = REACT_SUSPENSE_TYPE;

exports.isFragment = function(object) {
  return typeOf(object) === REACT_FRAGMENT_TYPE;
};

exports.isProfiler = function(object) {
  return typeOf(object) === REACT_PROFILER_TYPE;
};

exports.isStrictMode = function(object) {
  return typeOf(object) === REACT_STRICT_MODE_TYPE;
};

exports.isSuspense = function(object) {
  return typeOf(object) === REACT_SUSPENSE_TYPE;
};

exports.isElement = function(object) {
  return typeOf(object) === REACT_ELEMENT_TYPE;
};

exports.isPortal = function(object) {
  return typeOf(object) === REACT_PORTAL_TYPE;
};

exports.isForwardRef = function(object) {
  return typeOf(object) === REACT_FORWARD_REF_TYPE;
};

exports.isMemo = function(object) {
  return typeOf(object) === REACT_MEMO_TYPE;
};

exports.isLazy = function(object) {
  return typeOf(object) === REACT_LAZY_TYPE;
};

exports.isContextConsumer = function(object) {
  return typeOf(object) === REACT_CONTEXT_TYPE;
};

exports.isContextProvider = function(object) {
  return typeOf(object) === REACT_PROVIDER_TYPE;
};

module.exports = exports;