
var ansiRegex = /[\u001B\u009B][[\]()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

module.exports = function (str) {
    return typeof str === 'string' ? str.replace(ansiRegex, '') : str;
};