  return function wrapper() {
    return fn.apply(this, arguments);
  }
}
module.exports = wrappy;