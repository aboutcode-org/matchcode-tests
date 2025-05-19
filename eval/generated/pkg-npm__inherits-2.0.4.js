  if (typeof superCtor !== 'function' && superCtor !== null) {
    throw new TypeError('The super constructor to "inherits" must be null or a function');
  }
  ctor.super_ = superCtor;
  if (superCtor) {
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  }
}