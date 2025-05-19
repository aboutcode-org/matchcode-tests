
var ansiRegex = /[\u001b\u009b][[()\]#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nq-uy=><]/;

module.exports = function (str) {
    return typeof str === 'string' && ansiRegex.test(str);
};