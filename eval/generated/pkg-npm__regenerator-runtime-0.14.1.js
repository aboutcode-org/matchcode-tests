
var Op = Object.prototype;
var hasOwn = Op.hasOwnProperty;
var undef;
function wrap(innerFn, outerFn, self, tryLocsList) {
  var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
  var generator = Object.create(protoGenerator.prototype);
  var context = new Context(tryLocsList || []);
  generator._invoke = makeInvokeMethod(innerFn, self, context);
  return generator;
}
exports.wrap = wrap;
function tryCatch(fn, obj, arg) {
  try {
    return { type: "normal", arg: fn.call(obj, arg) };
  } catch (err) {
    return { type: "throw", arg: err };
  }
}
var GenStateSuspendedStart = "suspendedStart";
var GenStateSuspendedYield = "suspendedYield";
var GenStateExecuting = "executing";
var GenStateCompleted = "completed";
var ContinueSentinel = {};
function Generator() {}
function GeneratorFunction() {}
function GeneratorFunctionPrototype() {}
var IteratorPrototype = {};
IteratorPrototype[typeof Symbol === "function" && Symbol.iterator || "@@iterator"] = function () {
  return this;
};
var getProto = Object.getPrototypeOf;
var NativeIteratorPrototype = getProto && getProto(getProto([][Symbol.iterator]()));
if (NativeIteratorPrototype &&
  NativeIteratorPrototype !== Op &&
  hasOwn.call(NativeIteratorPrototype, Symbol.iterator)) {
  IteratorPrototype = NativeIteratorPrototype;
}
var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
GeneratorFunctionPrototype.constructor = GeneratorFunction;
GeneratorFunction.displayName = "GeneratorFunction";
function defineIteratorMethods(prototype) {
  ["next", "throw", "return"].forEach(function (method) {
    prototype[method] = function (arg) {
      return this._invoke(method, arg);
    };
  });
}
exports.isGeneratorFunction = function (genFun) {
  var ctor = typeof genFun === "function" && genFun.constructor;
  return ctor
    ? ctor === GeneratorFunction ||
      (ctor.displayName || ctor.name) === "GeneratorFunction"
    : false;
};
exports.mark = function (genFun) {
  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
  } else {
    genFun.__proto__ = GeneratorFunctionPrototype;
    if (!(Symbol.toStringTag in genFun)) {
      genFun[Symbol.toStringTag] = "GeneratorFunction";
    }
  }
  genFun.prototype = Object.create(Gp);
  return genFun;
};
exports.awrap = function (arg) {
  return { __await: arg };
};
function AsyncIterator(generator, PromiseImpl) {
  function invoke(method, arg, resolve, reject) {
    var record = tryCatch(generator[method], generator, arg);
    if (record.type === "throw") {
      reject(record.arg);
    } else {
      var result = record.arg;
      var value = result.value;
      if (value && typeof value === "object" && hasOwn.call(value, "__await")) {
        return PromiseImpl.resolve(value.__await).then(function (value) {
          invoke("next", value, resolve, reject);
        }, function (err) {
          invoke("throw", err, resolve, reject);
        });
      }
      return PromiseImpl.resolve(value).then(function (unwrapped) {
        result.value = unwrapped;
        resolve(result);
      }, function (error) {
        return invoke("throw", error, resolve, reject);
      });
    }
  }
  var previousPromise;
  function enqueue(method, arg) {
    function callInvokeWithMethodAndArg() {
      return new PromiseImpl(function (resolve, reject) {
        invoke(method, arg, resolve, reject);
      });
    }
    return previousPromise = previousPromise
      ? previousPromise.then(callInvokeWithMethodAndArg,
          callInvokeWithMethodAndArg)
      : callInvokeWithMethodAndArg();
  }
  this._invoke = enqueue;
}
defineIteratorMethods(AsyncIterator.prototype);
AsyncIterator.prototype[typeof Symbol === "function" && Symbol.asyncIterator || "@@asyncIterator"] = function () {
  return this;
};
exports.AsyncIterator = AsyncIterator;
exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
  if (PromiseImpl === void 0) PromiseImpl = Promise;
  var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
  return exports.isGeneratorFunction(outerFn)
    ? iter
    : iter.next().then(function (result) {
        return result.done ? result.value : iter.next();
      });
};
function makeInvokeMethod(innerFn, self, context) {
  var state = GenStateSuspendedStart;
  return function invoke(method, arg) {
    if (state === GenStateExecuting) {
      throw new Error("Generator is already running");
    }
    if (state === GenStateCompleted) {
      if (method === "throw") {
        throw arg;
      }
      return doneResult();
    }
    context.method = method;
    context.arg = arg;
    while (true) {
      var delegate = context.delegate;
      if (delegate) {
        var delegateResult = maybeInvokeDelegate(delegate, context);
        if (delegateResult) {
          if (delegateResult === ContinueSentinel) continue;
          return delegateResult;
        }
      }
      if (context.method === "next") {
        context.sent = context._sent = context.arg;
      } else if (context.method === "throw") {
        if (state === GenStateSuspendedStart) {
          state = GenStateCompleted;
          throw context.arg;
        }
        context.dispatchException(context.arg);
      } else if (context.method === "return") {
        context.abrupt("return", context.arg);
      }
      state = GenStateExecuting;
      var record = tryCatch(innerFn, self, context);
      if (record.type === "normal") {
        state = context.done ? GenStateCompleted : GenStateSuspendedYield;
        if (record.arg === ContinueSentinel) {
          continue;
        }
        return {
          value: record.arg,
          done: context.done
        };
      } else if (record.type === "throw") {
        state = GenStateCompleted;
        context.method = "throw";
        context.arg = record.arg;
      }
    }
  };
}
function maybeInvokeDelegate(delegate, context) {
  var method = delegate.iterator[context.method];
  if (method === undef) {
    context.delegate = null;
    if (context.method === "throw") {
      if (delegate.iterator.return) {
        context.method = "return";
        context.arg = undef;
        maybeInvokeDelegate(delegate, context);
        if (context.method === "throw") {
          return ContinueSentinel;
        }
      }
      context.method = "throw";
      context.arg = new TypeError("The iterator does not provide a 'throw' method");
    }
    return ContinueSentinel;
  }
  var record = tryCatch(method, delegate.iterator, context.arg);
  if (record.type === "throw") {
    context.method = "throw";
    context.arg = record.arg;
    context.delegate = null;
    return ContinueSentinel;
  }
  var info = record.arg;
  if (!info) {
    context.method = "throw";
    context.arg = new TypeError("iterator result is not an object");
    context.delegate = null;
    return ContinueSentinel;
  }
  if (info.done) {
    context[delegate.resultName] = info.value;
    context.next = delegate.nextLoc;
    if (context.method !== "return") {
      context.method = "next";
      context.arg = undef;
    }
  } else {
    return info;
  }
  context.delegate = null;
  return ContinueSentinel;
}
defineIteratorMethods(Gp);
Gp[typeof Symbol === "function" && Symbol.iterator || "@@iterator"] = function () {
  return this;
};
Gp.toString = function () {
  return "[object Generator]";
};
function pushTryEntry(locs) {
  var entry = { tryLoc: locs[0] };
  if (1 in locs) {
    entry.catchLoc = locs[1];
  }
  if (2 in locs) {
    entry.finallyLoc = locs[2];
    entry.afterLoc = locs[3];
  }
  this.tryEntries.push(entry);
}
function resetTryEntry(entry) {
  var record = entry.completion || {};
  record.type = "normal";
  delete record.arg;
  entry.completion = record;
}
function Context(tryLocsList) {
  this.tryEntries = [{ tryLoc: "root" }];
  tryLocsList.forEach(pushTryEntry, this);
  this.reset(true);
}
exports.keys = function (object) {
  var keys = [];
  for (var key in object) {
    keys.push(key);
  }
  keys.reverse();
  return function next() {
    while (keys.length) {
      var key = keys.pop();
      if (key in object) {
        next.value = key;
        next.done = false;
        return next;
      }
    }
    next.done = true;
    return next;
  };
};
function values(iterable) {
  if (iterable) {
    var iteratorMethod = iterable[typeof Symbol === "function" && Symbol.iterator || "@@iterator"];
    if (iteratorMethod) {
      return iteratorMethod.call(iterable);
    }
    if (typeof iterable.next === "function") {
      return iterable;
    }
    if (!isNaN(iterable.length)) {
      var i = -1, next = function next() {
        while (++i < iterable.length) {
          if (hasOwn.call(iterable, i)) {
            next.value = iterable[i];
            next.done = false;
            return next;
          }
        }
        next.value = undef;
        next.done = true;
        return next;
      };
      return next.next = next;
    }
  }
  return { next: doneResult };
}
exports.values = values;
function doneResult() {
  return { value: undef, done: true };
}
Context.prototype = {
  constructor: Context,
  reset: function (skipTempReset) {
    this.prev = 0;
    this.next = 0;
    this.sent = this._sent = undef;
    this.done = false;
    this.delegate = null;
    this.method = "next";
    this.arg = undef;
    this.tryEntries.forEach(resetTryEntry);
    if (!skipTempReset) {
      for (var name in this) {
        if (name.charAt(0) === "t" &&
            hasOwn.call(this, name) &&
            !isNaN(+name.slice(1))) {
          this[name] = undef;
        }
      }
    }
  },
  stop: function () {
    this.done = true;
    var rootEntry = this.tryEntries[0];
    var rootRecord = rootEntry.completion;
    if (rootRecord.type === "throw") {
      throw rootRecord.arg;
    }
    return this.rval;
  },
  dispatchException: function (exception) {
    if (this.done) {
      throw exception;
    }
    var context = this;
    function handle(loc, caught) {
      record.type = "throw";
      record.arg = exception;
      context.next = loc;
      if (caught) {
        context.method = "next";
        context.arg = undef;
      }
      return !!caught;
    }
    for (var i = this.tryEntries.length - 1; i >= 0; --i) {
      var entry = this.tryEntries[i];
      var record = entry.completion;
      if (entry.tryLoc === "root") {
        return handle("end");
      }
      if (entry.tryLoc <= this.prev) {
        var hasCatch = hasOwn.call(entry, "catchLoc");
        var hasFinally = hasOwn.call(entry, "finallyLoc");
        if (hasCatch && hasFinally) {
          if (this.prev < entry.catchLoc) {
            return handle(entry.catchLoc, true);
          } else if (this.prev < entry.finallyLoc) {
            return handle(entry.finallyLoc);
          }
        } else if (hasCatch) {
          if (this.prev < entry.catchLoc) {
            return handle(entry.catchLoc, true);
          }
        } else if (hasFinally) {
          if (this.prev < entry.finallyLoc) {
            return handle(entry.finallyLoc);
          }
        } else {
          throw new Error("try statement without catch or finally");
        }
      }
    }
  },
  abrupt: function (type, arg) {
    for (var i = this.tryEntries.length - 1; i >= 0; --i) {
      var entry = this.tryEntries[i];
      if (entry.finallyLoc && this.prev < entry.finallyLoc && this.next < entry.finallyLoc) {
        var record = entry.completion;
        record.type = type;
        record.arg = arg;
        this.next = entry.finallyLoc;
        this.method = "next";
        this.arg = undef;
        return ContinueSentinel;
      }
    }
    return this.complete({ type: type, arg: arg });
  },
  complete: function (record, afterLoc) {
    if (record.type === "throw") {
      throw record.arg;
    }
    if (record.type === "break" || record.type === "continue") {
      this.next = record.arg;
    } else if (record.type === "return") {
      this.rval = this.arg = record.arg;
      this.method = "return";
      this.next = "end";
    } else if (record.type === "normal" && afterLoc) {
      this.next = afterLoc;
    }
    return ContinueSentinel;
  },
  finish: function (finallyLoc) {
    for (var i = this.tryEntries.length - 1; i >= 0; --i) {
      var entry = this.tryEntries[i];
      if (entry.finallyLoc === finallyLoc) {
        this.complete(entry.completion, entry.afterLoc);
        resetTryEntry(entry);
        return ContinueSentinel;
      }
    }
  },
  catch: function (tryLoc) {
    for (var i = this.tryEntries.length - 1; i >= 0; --i) {
      var entry = this.tryEntries[i];
      if (entry.tryLoc === tryLoc) {
        var record = entry.completion;
        if (record.type === "throw") {
          var thrown = record.arg;
          resetTryEntry(entry);
        }
        return thrown;
      }
    }
    throw new Error("illegal catch attempt");
  },
  delegateYield: function (iterable, resultName, nextLoc) {
    this.delegate = {
      iterator: values(iterable),
      resultName: resultName,
      nextLoc: nextLoc
    };
    if (this.method === "next") {
      this.arg = undef;
    }
    return ContinueSentinel;
  }
};