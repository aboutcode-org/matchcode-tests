
var debug = (function() {
    var namespaces = '';
    var colors = [
        6, 2, 3, 4, 5, 1
    ];
    var prevTime;
    var enabled = false;

    function selectColor(namespace) {
        var hash = 0, i;
        for (i = 0; i < namespace.length; i++) {
            hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
            hash |= 0;
        }
        return colors[Math.abs(hash) % colors.length];
    }

    function coerce(val) {
        if (val instanceof Error) return val.stack || val.message;
        return val;
    }

    function humanize(ms) {
        var s = 1000, m = 60 * s, h = 60 * m, d = 24 * h, y = 365.25 * d;
        if (ms >= y) return (ms / y).toFixed(1) + 'y';
        if (ms >= d) return (ms / d).toFixed(1) + 'd';
        if (ms >= h) return (ms / h).toFixed(1) + 'h';
        if (ms >= m) return (ms / m).toFixed(1) + 'm';
        if (ms >= s) return (ms / s | 0) + 's';
        return ms + 'ms';
    }

    function Debug(namespace) {
        function log() {
            if (!Debug.enabled(namespace)) return;
            var curr = +new Date();
            var args = new Array(arguments.length), i;
            for (i = 0; i < args.length; i++) {
                args[i] = coerce(arguments[i]);
            }
            args[0] = namespace + ' ' + args[0];
            var color = selectColor(namespace);
            var diff = curr - (prevTime || curr);
            prevTime = curr;
            args.push('+' + humanize(diff));
            if (typeof window !== 'undefined' && window.console) {
                if (console.log) {
                    Function.prototype.apply.call(console.log, console, args);
                }
            } else if (typeof process !== 'undefined' && process.stdout) {
                process.stdout.write(args.join(' ') + '\n');
            }
        }
        log.namespace = namespace;
        return log;
    }

    Debug.names = [];
    Debug.skips = [];

    Debug.enable = function(name) {
        namespaces = name;
        Debug.names = [];
        Debug.skips = [];
        var split = (name || '').split(/[\s,]+/);
        for (var i = 0; i < split.length; i++) {
            if (!split[i]) continue;
            name = split[i].replace(/\*/g, '.*?');
            if (name[0] === '-') {
                Debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
            } else {
                Debug.names.push(new RegExp('^' + name + '$'));
            }
        }
    };

    Debug.disable = function() {
        Debug.enable('');
    };

    Debug.enabled = function(name) {
        var i, re;
        for (i = 0; i < Debug.skips.length; i++) {
            re = Debug.skips[i];
            if (re.test(name)) return false;
        }
        for (i = 0; i < Debug.names.length; i++) {
            re = Debug.names[i];
            if (re.test(name)) return true;
        }
        return false;
    };

    Debug.log = function() {
        return Function.prototype.apply.call(console.log, console, arguments);
    };

    return Debug;
})();

module.exports = debug;