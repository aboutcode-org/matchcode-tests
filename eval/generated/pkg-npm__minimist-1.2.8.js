    if (!opts) opts = {};
    var argv = { _: [] };
    var flags = { bools: {}, strings: {} };

    if (opts['boolean'] != null) {
        (Array.isArray(opts['boolean']) ? opts['boolean'] : [opts['boolean']]).forEach(function(key) {
            flags.bools[key] = true;
        });
    }

    if (opts['string'] != null) {
        (Array.isArray(opts['string']) ? opts['string'] : [opts['string']]).forEach(function(key) {
            flags.strings[key] = true;
        });
    }

    var alias = {};
    if (opts.alias != null) {
        Object.keys(opts.alias).forEach(function(key) {
            alias[key] = [].concat(opts.alias[key]);
            alias[key].forEach(function(x) {
                alias[x] = alias[key];
            });
        });
    }

    var defaults = opts.default || {};
    var notFlags = {};

    if (opts['--']) {
        argv['--'] = [];
    }

    function setKey(obj, keys, value) {
        var o = obj;
        for (var i = 0; i < keys.length - 1; i++) {
            if (o[keys[i]] === undefined) o[keys[i]] = {};
            o = o[keys[i]];
        }
        var key = keys[keys.length - 1];
        if (o[key] === undefined || flags.bools[key] || typeof o[key] === typeof value) {
            o[key] = value;
        } else if (Array.isArray(o[key])) {
            o[key].push(value);
        } else {
            o[key] = [o[key], value];
        }
    }

    function aliasKeys(key) {
        return [key].concat(alias[key] || []);
    }

    for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        if (arg === '--') {
            argv._ = argv._.concat(args.slice(i + 1));
            if (opts['--']) argv['--'] = args.slice(i + 1);
            break;
        } else if (/^--/.test(arg)) {
            var key, value;
            var m = arg.match(/^--([^=]+)=([\s\S]*)$/);
            if (m) {
                key = m[1];
                value = m[2];
            } else if (/^--no-.+/.test(arg)) {
                key = arg.match(/^--no-(.+)/)[1];
                value = false;
            } else {
                key = arg.match(/^--(.+)/)[1];
                if (i + 1 < args.length && !/^(-|--)[^-]/.test(args[i + 1]) && !flags.bools[key]) {
                    value = args[++i];
                } else if (flags.strings[key]) {
                    value = '';
                } else {
                    value = true;
                }
            }
            aliasKeys(key).forEach(function(k) {
                setKey(argv, k.split('.'), value);
            });
        } else if (/^-/.test(arg) && arg !== '-') {
            var letters = arg.substr(1).split('');
            for (var j = 0; j < letters.length; j++) {
                var next = arg.substr(j + 2);
                var key = letters[j];
                if (next && /^[^\d]/.test(next)) {
                    aliasKeys(key).forEach(function(k) {
                        setKey(argv, k.split('.'), next);
                    });
                    break;
                }
                if (j + 1 === letters.length) {
                    if (i + 1 < args.length && !/^(-|--)[^-]/.test(args[i + 1]) && !flags.bools[key]) {
                        aliasKeys(key).forEach(function(k) {
                            setKey(argv, k.split('.'), args[++i]);
                        });
                    } else if (flags.strings[key]) {
                        aliasKeys(key).forEach(function(k) {
                            setKey(argv, k.split('.'), '');
                        });
                    } else {
                        aliasKeys(key).forEach(function(k) {
                            setKey(argv, k.split('.'), true);
                        });
                    }
                } else {
                    aliasKeys(key).forEach(function(k) {
                        setKey(argv, k.split('.'), true);
                    });
                }
            }
        } else {
            argv._.push(arg);
            if (opts.stopEarly) {
                argv._ = argv._.concat(args.slice(i + 1));
                break;
            }
        }
    }

    Object.keys(defaults).forEach(function(key) {
        var def = defaults[key];
        aliasKeys(key).forEach(function(k) {
            var path = k.split('.');
            var o = argv;
            for (var j = 0; j < path.length - 1; j++) {
                if (!(path[j] in o)) return;
                o = o[path[j]];
            }
            var last = path[path.length - 1];
            if (o[last] === undefined) {
                setKey(argv, k.split('.'), def);
            }
        });
    });

    return argv;
}