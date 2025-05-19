var activeCalls = {}

module.exports = wrap

function wrap(key, callback) {
  if (activeCalls[key]) {
    activeCalls[key].push(callback)
    return
  }
  activeCalls[key] = [callback]
  process.nextTick(function() {
    callback(done)
  })
  function done() {
    var args = arguments
    var list = activeCalls[key]
    if (!list) return
    delete activeCalls[key]
    for (var i = 0; i < list.length; i++) {
      list[i].apply(null, args)
    }
  }
}