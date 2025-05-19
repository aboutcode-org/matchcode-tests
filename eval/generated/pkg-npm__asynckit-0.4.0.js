module.exports = asyncKit;

function asyncKit(tasks, cb) {
  if (!Array.isArray(tasks)) return cb(null, []);
  var len = tasks.length;
  if (!len) return cb(null, []);
  var result = new Array(len);
  var completed = 0;
  var called = false;
  for (var i = 0; i < len; i++) {
    runTask(i);
  }
  function runTask(idx) {
    setImmediate(function () {
      tasks[idx](function done(err, res) {
        if (called) return;
        if (err) {
          called = true;
          cb(err);
          return;
        }
        result[idx] = res;
        completed++;
        if (completed === len) cb(null, result);
      });
    });
  }
}