
var fs = require('fs');
var path = require('path');

function isFile(file) {
    try {
        var stat = fs.statSync(file);
        return stat.isFile() || stat.isFIFO();
    } catch (e) {
        return false;
    }
}

function defaultIsDirectory(d) {
    try {
        return fs.statSync(d).isDirectory();
    } catch (e) {
        return false;
    }
}

function defaultReadFileSync(file, encoding) {
    return fs.readFileSync(file, encoding);
}

var defaultExtensions = ['.js', '.json', '.node'];
var moduleDir = 'node_modules';

function resolveSync(x, options) {
    options = options || {};
    var basedir = options.basedir || process.cwd();
    var extensions = options.extensions || defaultExtensions;
    var isDir = options.isDirectory || defaultIsDirectory;
    var readFileSync = options.readFileSync || defaultReadFileSync;
    var packageFilter = options.packageFilter;
    if (x.charAt(0) === '/' || x.charAt(0) === '\\' || x.match(/^[a-zA-Z]:\\/)) {
        return loadAsFileSync(path.resolve(basedir, x)) || loadAsDirectorySync(path.resolve(basedir, x));
    } else if (x.charAt(0) === '.') {
        return loadAsFileSync(path.resolve(basedir, x)) || loadAsDirectorySync(path.resolve(basedir, x));
    } else {
        return loadNodeModulesSync(x, basedir);
    }

    function loadAsFileSync(x) {
        if (isFile(x)) return x;
        for (var i = 0; i < extensions.length; i++) {
            var file = x + extensions[i];
            if (isFile(file)) return file;
        }
        return;
    }

    function loadAsDirectorySync(x) {
        var pkgfile = path.join(x, 'package.json');
        if (isFile(pkgfile)) {
            try {
                var pkg = JSON.parse(readFileSync(pkgfile, 'utf8'));
                if (packageFilter) pkg = packageFilter(pkg, x);
                var main = pkg.main || 'index.js';
                var m = loadAsFileSync(path.resolve(x, main)) || loadAsDirectorySync(path.resolve(x, main));
                if (m) return m;
            } catch (e) {}
        }
        return loadAsFileSync(path.join(x, 'index')) || undefined;
    }

    function loadNodeModulesSync(x, start) {
        var dirs = nodeModulesPaths(start);
        for (var i = 0; i < dirs.length; i++) {
            var dir = dirs[i];
            var m = loadAsFileSync(path.join(dir, x));
            if (m) return m;
            m = loadAsDirectorySync(path.join(dir, x));
            if (m) return m;
        }
        throw new Error("Cannot find module '" + x + "' from '" + basedir + "'");
    }

    function nodeModulesPaths(start) {
        var parts = start.split(path.sep);
        var dirs = [];
        for (var i = parts.length; i > 0; i--) {
            if (parts[i - 1] === moduleDir) continue;
            var dir = path.join.apply(path, parts.slice(0, i).concat([moduleDir]));
            dirs.push(dir);
        }
        return dirs;
    }
}

module.exports = resolveSync;