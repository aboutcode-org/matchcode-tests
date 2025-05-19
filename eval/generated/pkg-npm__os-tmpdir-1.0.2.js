
module.exports = function () {
    if (process.platform === 'win32') {
        return process.env.TEMP ||
            process.env.TMP ||
            (process.env.SystemRoot || process.env.windir) && (process.env.SystemRoot || process.env.windir) + '\\temp' ||
            'C:\\Windows\\Temp';
    }

    if (process.platform === 'darwin') {
        return '/tmp';
    }

    return process.env.TMPDIR ||
        process.env.TMP ||
        process.env.TEMP ||
        '/tmp';
};