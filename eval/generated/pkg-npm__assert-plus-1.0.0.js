
function _isArguments(object) {
  return Object.prototype.toString.call(object) === '[object Arguments]';
}
function _objEquiv(a, b, strict, actualVisitedObjects) {
  if (a === null || a === undefined || b === null || b === undefined) return false;
  if (a instanceof Buffer && b instanceof Buffer) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (_isArguments(a) !== _isArguments(b)) return false;
  if (Array.isArray(a) || _isArguments(a)) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if (!_deepEqual(a[i], b[i], strict, actualVisitedObjects)) return false;
    }
    return true;
  }
  var ka = Object.keys(a);
  var kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  ka.sort();
  kb.sort();
  for (var i = 0; i < ka.length; i++) {
    if (ka[i] !== kb[i]) return false;
  }
  for (var i = 0; i < ka.length; i++) {
    var key = ka[i];
    if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects)) return false;
  }
  return true;
}
function _deepEqual(actual, expected, strict, actualVisitedObjects) {
  if (actual === expected) return true;
  if (strict) {
    if (typeof actual !== 'object' || typeof expected !== 'object' ||
      actual === null || expected === null) return false;
  } else {
    if (actual == null || expected == null) return actual == expected;
    if (typeof actual !== 'object' && typeof expected !== 'object') {
      return actual == expected;
    }
    if (typeof actual !== typeof expected) return false;
  }
  actualVisitedObjects = actualVisitedObjects || [];
  for (var i = 0; i < actualVisitedObjects.length; i++) {
    if (actualVisitedObjects[i][0] === actual && actualVisitedObjects[i][1] === expected) {
      return true;
    }
  }
  actualVisitedObjects.push([actual, expected]);
  return _objEquiv(actual, expected, strict, actualVisitedObjects);
}

function AssertionError(options) {
  this.name = 'AssertionError';
  this.message = options.message || 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, options.stackStartFunction || AssertionError);
  }
}
AssertionError.prototype = Object.create(Error.prototype);
AssertionError.prototype.constructor = AssertionError;

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction || fail
  });
}

function ok(value, message) {
  if (!value) fail(value, true, message, '==', ok);
}

function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', equal);
}

function notEqual(actual, expected, message) {
  if (actual == expected) fail(actual, expected, message, '!=', notEqual);
}

function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, false)) fail(actual, expected, message, 'deepEqual', deepEqual);
}

function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, false)) fail(actual, expected, message, 'notDeepEqual', notDeepEqual);
}

function strictEqual(actual, expected, message) {
  if (actual !== expected) fail(actual, expected, message, '===', strictEqual);
}

function notStrictEqual(actual, expected, message) {
  if (actual === expected) fail(actual, expected, message, '!==', notStrictEqual);
}

function throws(block, error, message) {
  var actual;
  try {
    block();
  } catch (e) {
    actual = e;
  }
  if (!actual) fail(actual, error, message, 'throws', throws);
  if (error && !(actual instanceof error)) fail(actual, error, message, 'throws', throws);
}

function doesNotThrow(block, error, message) {
  try {
    block();
  } catch (e) {
    if (!error || (e instanceof error)) fail(e, error, message, 'doesNotThrow', doesNotThrow);
  }
}

module.exports = {
  AssertionError: AssertionError,
  fail: fail,
  ok: ok,
  equal: equal,
  notEqual: notEqual,
  deepEqual: deepEqual,
  notDeepEqual: notDeepEqual,
  strictEqual: strictEqual,
  notStrictEqual: notStrictEqual,
  throws: throws,
  doesNotThrow: doesNotThrow
};