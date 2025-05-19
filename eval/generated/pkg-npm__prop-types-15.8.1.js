(function(global) {
  var ANONYMOUS = '<<anonymous>>';
  var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

  function emptyFunction() {}

  function PropTypeError(message) {
    this.message = message;
    this.stack = '';
  }
  PropTypeError.prototype = Error.prototype;

  function createChainableTypeChecker(validate) {
    function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
      componentName = componentName || ANONYMOUS;
      propFullName = propFullName || propName;

      if (secret !== ReactPropTypesSecret) {
        throw new Error(
          'Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() instead.'
        );
      }
      if (props[propName] == null) {
        if (isRequired) {
          return new PropTypeError(
            'The ' +
              location +
              ' `' +
              propFullName +
              '` is marked as required in `' +
              componentName +
              '`, but its value is ' +
              (props[propName] === null ? '`null`' : '`undefined`') +
              '.'
          );
        }
        return null;
      } else {
        return validate(props, propName, componentName, location, propFullName);
      }
    }

    var chainedCheckType = checkType.bind(null, false);
    chainedCheckType.isRequired = checkType.bind(null, true);

    return chainedCheckType;
  }

  function createPrimitiveTypeChecker(expectedType) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== expectedType) {
        var preciseType = getPreciseType(propValue);

        return new PropTypeError(
          'Invalid ' +
            location +
            ' `' +
            propFullName +
            '` of type `' +
            preciseType +
            '` supplied to `' +
            componentName +
            '`, expected `' +
            expectedType +
            '`.'
        );
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createAnyTypeChecker() {
    return createChainableTypeChecker(emptyFunction);
  }

  function createArrayOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      if (!Array.isArray(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError(
          'Invalid ' +
            location +
            ' `' +
            propFullName +
            '` of type `' +
            propType +
            '` supplied to `' +
            componentName +
            '`, expected an array.'
        );
      }
      for (var i = 0; i < propValue.length; i++) {
        var error = typeChecker(
          propValue,
          i,
          componentName,
          location,
          propFullName + '[' + i + ']',
          ReactPropTypesSecret
        );
        if (error instanceof Error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createElementTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      if (!isValidElement(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError(
          'Invalid ' +
            location +
            ' `' +
            propFullName +
            '` of type `' +
            propType +
            '` supplied to `' +
            componentName +
            '`, expected a single ReactElement.'
        );
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createInstanceTypeChecker(expectedClass) {
    function validate(props, propName, componentName, location, propFullName) {
      if (!(props[propName] instanceof expectedClass)) {
        var expectedClassName = expectedClass.name || ANONYMOUS;
        var actualClassName = getClassName(props[propName]);
        return new PropTypeError(
          'Invalid ' +
            location +
            ' `' +
            propFullName +
            '` of type `' +
            actualClassName +
            '` supplied to `' +
            componentName +
            '`, expected instance of `' +
            expectedClassName +
            '`.'
        );
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createEnumTypeChecker(expectedValues) {
    if (!Array.isArray(expectedValues)) {
      return function() {
        return new PropTypeError('Invalid argument supplied to oneOf, expected an instance of array.');
      };
    }

    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      for (var i = 0; i < expectedValues.length; i++) {
        if (is(propValue, expectedValues[i])) {
          return null;
        }
      }

      var valuesString = JSON.stringify(expectedValues);
      return new PropTypeError(
        'Invalid ' +
          location +
          ' `' +
          propFullName +
          '` of value `' +
          String(propValue) +
          '` supplied to `' +
          componentName +
          '`, expected one of ' +
          valuesString +
          '.'
      );
    }
    return createChainableTypeChecker(validate);
  }

  function createObjectOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError(
          'Invalid ' +
            location +
            ' `' +
            propFullName +
            '` of type `' +
            propType +
            '` supplied to `' +
            componentName +
            '`, expected an object.'
        );
      }
      for (var key in propValue) {
        if (Object.prototype.hasOwnProperty.call(propValue, key)) {
          var error = typeChecker(
            propValue,
            key,
            componentName,
            location,
            propFullName + '.' + key,
            ReactPropTypesSecret
          );
          if (error instanceof Error) {
            return error;
          }
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createUnionTypeChecker(arrayOfTypeCheckers) {
    if (!Array.isArray(arrayOfTypeCheckers)) {
      return function() {
        return new PropTypeError('Invalid argument supplied to oneOfType, expected an instance of array.');
      };
    }

    function validate(props, propName, componentName, location, propFullName) {
      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
        var checker = arrayOfTypeCheckers[i];
        if (
          checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret) == null
        ) {
          return null;
        }
      }
      return new PropTypeError(
        'Invalid ' +
          location +
          ' `' +
          propFullName +
          '` supplied to `' +
          componentName +
          '`.'
      );
    }
    return createChainableTypeChecker(validate);
  }

  function createNodeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      if (!isNode(props[propName])) {
        return new PropTypeError(
          'Invalid ' +
            location +
            ' `' +
            propFullName +
            '` supplied to `' +
            componentName +
            '`, expected a ReactNode.'
        );
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object' || propValue === null) {
        return new PropTypeError(
          'Invalid ' +
            location +
            ' `' +
            propFullName +
            '` of type `' +
            propType +
            '` supplied to `' +
            componentName +
            '`, expected `object`.'
        );
      }
      for (var key in shapeTypes) {
        var checker = shapeTypes[key];
        if (!checker) {
          continue;
        }
        var error = checker(
          propValue,
          key,
          componentName,
          location,
          propFullName + '.' + key,
          ReactPropTypesSecret
        );
        if (error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function getPropType(propValue) {
    var propType = typeof propValue;
    if (Array.isArray(propValue)) {
      return 'array';
    }
    if (propValue instanceof RegExp) {
      return 'object';
    }
    return propType;
  }

  function getPreciseType(propValue) {
    var typeofPropValue = typeof propValue;
    if (typeofPropValue === 'object') {
      if (Array.isArray(propValue)) {
        return 'array';
      }
      if (propValue instanceof Date) {
        return 'date';
      }
      if (propValue instanceof RegExp) {
        return 'regexp';
      }
    }
    return typeofPropValue;
  }

  function getClassName(propValue) {
    if (!propValue || typeof propValue !== 'object') {
      return '' + propValue;
    }
    var constructor = propValue.constructor;
    return constructor && constructor.name ? constructor.name : '<<anonymous>>';
  }

  function is(x, y) {
    if (x === y) {
      return x !== 0 || 1 / x === 1 / y;
    } else {
      return x !== x && y !== y;
    }
  }

  function isNode(object) {
    switch (typeof object) {
      case 'number':
      case 'string':
      case 'undefined':
        return true;
      case 'boolean':
        return !object;
      case 'object':
        if (Array.isArray(object)) {
          return object.every(isNode);
        }
        if (object === null || isValidElement(object)) {
          return true;
        }
        if (
          object &&
          typeof object === 'object' &&
          typeof object.$$typeof === 'symbol' &&
          String(object.$$typeof).indexOf('react.element') > -1
        ) {
          return true;
        }
        return false;
      default:
        return false;
    }
  }

  function isValidElement(element) {
    if (!element || typeof element !== 'object') return false;
    var $$typeof = typeof Symbol === 'function' && Symbol.for ? Symbol.for('react.element') : 0xeac7;
    return element.$$typeof === $$typeof;
  }

  var PropTypes = {
    any: createAnyTypeChecker(),
    array: createPrimitiveTypeChecker('array'),
    bool: createPrimitiveTypeChecker('boolean'),
    func: createPrimitiveTypeChecker('function'),
    number: createPrimitiveTypeChecker('number'),
    object: createPrimitiveTypeChecker('object'),
    string: createPrimitiveTypeChecker('string'),
    symbol: createPrimitiveTypeChecker('symbol'),

    arrayOf: createArrayOfTypeChecker,
    element: createElementTypeChecker(),
    instanceOf: createInstanceTypeChecker,
    node: createNodeChecker(),
    objectOf: createObjectOfTypeChecker,
    oneOf: createEnumTypeChecker,
    oneOfType: createUnionTypeChecker,
    shape: createShapeTypeChecker
  };

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = PropTypes;
  } else {
    global.PropTypes = PropTypes;
  }
})(this);