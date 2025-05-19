module.exports = function(flag, argv) {
    if (typeof flag !== 'string') {
        throw new TypeError('Flag must be a string');
    }
    var arr = argv || process.argv;
    var prefix = flag.length === 1 ? '-' : '--';
    var pos = arr.indexOf(prefix + flag);
    var posEq = arr.indexOf(prefix + flag + '=');
    return pos !== -1 || arr.some(function(arg) {
        return arg.startsWith(prefix + flag + '=');
    });
};