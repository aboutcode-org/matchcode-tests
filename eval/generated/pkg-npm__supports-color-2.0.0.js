
var env = process.env;
var argv = process.argv;

module.exports = (function () {
    if ('FORCE_COLOR' in env) {
        if (env.FORCE_COLOR === '0') {
            return false;
        }
        return true;
    }
    if ('NODE_DISABLE_COLORS' in env) {
        return false;
    }
    if ('NO_COLOR' in env) {
        return false;
    }
    if ('TERM' in env && env.TERM === 'dumb') {
        return false;
    }
    if (argv.indexOf('--no-color') !== -1 ||
        argv.indexOf('--color=false') !== -1) {
        return false;
    }
    if (argv.indexOf('--color') !== -1 ||
        argv.indexOf('--colors') !== -1 ||
        argv.indexOf('--color=true') !== -1 ||
        argv.indexOf('--color=always') !== -1) {
        return true;
    }
    if (process.stdout && !process.stdout.isTTY) {
        return false;
    }
    if (process.platform === 'win32') {
        return true;
    }
    if ('CI' in env) {
        if ('TRAVIS' in env || 'CIRCLECI' in env || 'APPVEYOR' in env || 'GITLAB_CI' in env || env.CI_NAME === 'codeship') {
            return true;
        }
        return false;
    }
    if ('TEAMCITY_VERSION' in env) {
        return (/^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/).test(env.TEAMCITY_VERSION) ? true : false;
    }
    if (/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(env.TERM)) {
        return true;
    }
    return false;
})();