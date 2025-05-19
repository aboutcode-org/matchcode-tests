  var namespaces = [];
  var prevColors = 0;
  var colors = [
    6,2,3,4,5,1,9,10,11,12,13,14,15,16,17,18
  ];
  var isNode = typeof process !== "undefined" && process.versions && process.versions.node;

  function selectColor(namespace) {
    var hash = 0;
    for(var i=0; i<namespace.length; i++) {
      hash = ((hash<<5) - hash) + namespace.charCodeAt(i);
      hash |= 0;
    }
    return colors[Math.abs(hash) % colors.length];
  }

  function enabled(name) {
    if (!namespaces.length) return false;
    for (var i=0; i<namespaces.length; i++) {
      if (namespaces[i].test(name)) return true;
    }
    return false;
  }

  function Debug(namespace) {
    function debug() {
      if (!debug.enabled) return;
      var curr = +new Date;
      var ms = curr - (debug.prevTime || curr);
      debug.prevTime = curr;
      var args = Array.prototype.slice.call(arguments);
      var color = Debug.useColors ? '\x1b[3' + debug.color + 'm' : '';
      var reset = Debug.useColors ? '\x1b[0m' : '';
      var prefix = color + namespace + reset;
      if (Debug.useColors) {
        args.unshift(prefix);
      } else {
        args.unshift(namespace);
      }
      if (ms !== 0) args.push('+' + ms + 'ms');
      (console.debug || console.log).apply(console, args);
    }
    debug.namespace = namespace;
    debug.enabled = enabled(namespace);
    debug.color = selectColor(namespace);
    debug.prevTime = null;
    return debug;
  }

  Debug.useColors = isNode ? (process.stdout && process.stdout.isTTY) : (typeof window !== 'undefined' && (window.chrome || window.console && (console.firebug || (console.exception && console.table))));
  Debug.namespaces = function(str) {
    namespaces = [];
    if (!str) return;
    var split = str.split(/[\s,]+/);
    for (var i=0; i<split.length; i++) {
      if (!split[i]) continue;
      namespaces.push(new RegExp('^' + split[i].replace(/\*/g, '.*?') + '$'));
    }
  };

  if(typeof process !== "undefined" && process.env && process.env.DEBUG) {
    Debug.namespaces(process.env.DEBUG);
  } else if(typeof localStorage !== 'undefined' && localStorage.getItem('debug')) {
    Debug.namespaces(localStorage.getItem('debug'));
  }

  Debug.enable = function(str) {
    Debug.namespaces(str);
  };

  Debug.disable = function() {
    namespaces = [];
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = Debug;
  } else {
    global.debug = Debug;
  }

})(this);