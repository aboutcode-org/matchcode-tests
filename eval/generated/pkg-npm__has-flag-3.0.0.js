module.exports = function(flag, argv) {
    var index, flags;
    if (typeof argv === 'undefined') {
        argv = process.argv;
    }
    flags = argv;
    index = flags.indexOf('--');
    if (index !== -1) {
        flags = flags.slice(0, index);
    }
    return flags.indexOf('--' + flag) !== -1 ||
        flags.indexOf('-' + flag) !== -1;
};