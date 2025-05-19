    env: {},
    argv: [],
    stdin: {
        on: function(event, handler) {},
        setEncoding: function(encoding) {},
        resume: function() {},
        pause: function() {}
    },
    stdout: {
        write: function(data) {},
        on: function(event, handler) {}
    },
    stderr: {
        write: function(data) {},
        on: function(event, handler) {}
    },
    exit: function(code) {},
    cwd: function() {
        return "/";
    },
    chdir: function(directory) {},
    nextTick: function(callback) {
        setTimeout(callback, 0);
    },
    platform: "linux",
    pid: 1,
    version: "v20.11.20",
    versions: {},
    uptime: function() {
        return (Date.now() - (this._start || (this._start = Date.now()))) / 1000;
    }
};

var fs = {
    readFile: function(path, encoding, callback) {
        if (typeof encoding === "function") {
            callback = encoding;
            encoding = null;
        }
        callback(new Error("Not implemented"));
    },
    writeFile: function(path, data, encoding, callback) {
        if (typeof encoding === "function") {
            callback = encoding;
            encoding = null;
        }
        callback(new Error("Not implemented"));
    },
    existsSync: function(path) {
        return false;
    },
    readFileSync: function(path, encoding) {
        throw new Error("Not implemented");
    },
    writeFileSync: function(path, data, encoding) {
        throw new Error("Not implemented");
    }
};

var pathModule = {
    basename: function(path, ext) {
        var base = path.split(/[\\/]/).pop();
        if (ext && base.endsWith(ext)) return base.slice(0, -ext.length);
        return base;
    },
    join: function() {
        return Array.prototype.join.call(arguments, "/").replace(/\/+/g, "/");
    },
    resolve: function() {
        return "/" + Array.prototype.join.call(arguments, "/").replace(/\/+/g, "/");
    },
    dirname: function(path) {
        var parts = path.split(/[\\/]/);
        parts.pop();
        return parts.join("/") || "/";
    },
    extname: function(path) {
        var base = path.split(/[\\/]/).pop();
        var ix = base.lastIndexOf(".");
        return ix > 0 ? base.slice(ix) : "";
    }
};

var os = {
    type: function() {
        return "Linux";
    },
    platform: function() {
        return "linux";
    },
    homedir: function() {
        return "/home/user";
    },
    tmpdir: function() {
        return "/tmp";
    },
    cpus: function() {
        return [];
    },
    freemem: function() {
        return 0;
    },
    totalmem: function() {
        return 0;
    },
    arch: function() {
        return "x64";
    }
};

var util = {
    format: function() {
        var args = Array.prototype.slice.call(arguments);
        return args.join(" ");
    },
    inspect: function(obj) {
        try {
            return JSON.stringify(obj);
        } catch(e) {
            return String(obj);
        }
    }
};

var events = {
    EventEmitter: function() {
        this._events = {};
        this.on = function(event, handler) {
            (this._events[event] = this._events[event] || []).push(handler);
            return this;
        };
        this.emit = function(event) {
            var args = Array.prototype.slice.call(arguments, 1);
            var handlers = this._events[event] || [];
            for (var i=0; i < handlers.length; i++) {
                handlers[i].apply(this, args);
            }
        };
        this.removeListener = function(event, handler) {
            var handlers = this._events[event] || [];
            for (var i=handlers.length-1; i>=0; i--) {
                if (handlers[i] === handler) handlers.splice(i, 1);
            }
        };
    }
};

var buffer = {
    Buffer: function(input, encoding) {
        if (!(this instanceof buffer.Buffer)) return new buffer.Buffer(input, encoding);
        if (typeof input === "number") {
            this.length = input;
            this._data = [];
            for (var i=0; i < input; i++) this._data[i] = 0;
        } else if (typeof input === "string") {
            this._data = input.split("").map(function(c){ return c.charCodeAt(0); });
            this.length = this._data.length;
        } else if (Array.isArray(input)) {
            this._data = input.slice();
            this.length = input.length;
        } else {
            this._data = [];
            this.length = 0;
        }
    }
};
buffer.Buffer.prototype.toString = function(encoding) {
    if (encoding === "hex") {
        return Array.prototype.map.call(this._data, function(n) {
            return ("0" + n.toString(16)).slice(-2);
        }).join("");
    }
    return String.fromCharCode.apply(null, this._data);
};