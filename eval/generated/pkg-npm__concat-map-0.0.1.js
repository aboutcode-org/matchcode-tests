  var res = [];
  for (var i = 0; i < xs.length; i++) {
    var x = fn(xs[i], i);
    if (Array.isArray(x)) {
      for (var j = 0; j < x.length; j++) {
        res.push(x[j]);
      }
    } else {
      res.push(x);
    }
  }
  return res;
};