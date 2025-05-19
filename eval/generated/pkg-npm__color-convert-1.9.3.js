var conversions = {
    rgb: { channels: 3, labels: 'rgb' },
    hsl: { channels: 3, labels: 'hsl' },
    hsv: { channels: 3, labels: 'hsv' },
    cmyk: { channels: 4, labels: 'cmyk' },
    keyword: { channels: 1, labels: ['keyword'] }
};

var reverseKeywords = {};
var cssKeywords = {
    aliceblue: [240, 248, 255], antiquewhite: [250, 235, 215], aqua: [0, 255, 255], black: [0, 0, 0], blue: [0, 0, 255], fuchsia: [255, 0, 255], gray: [128, 128, 128], green: [0, 128, 0], lime: [0, 255, 0], maroon: [128, 0, 0], navy: [0, 0, 128], olive: [128, 128, 0], orange: [255, 165, 0], purple: [128, 0, 128], red: [255, 0, 0], silver: [192, 192, 192], teal: [0, 128, 128], white: [255, 255, 255], yellow: [255, 255, 0]
};

Object.keys(cssKeywords).forEach(function(key) {
    reverseKeywords[cssKeywords[key]] = key;
});

function rgb2hsl(rgb) {
    var r = rgb[0] / 255,
        g = rgb[1] / 255,
        b = rgb[2] / 255,
        max = Math.max(r, g, b),
        min = Math.min(r, g, b),
        h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h = h * 60;
    }
    return [h || 0, s * 100, l * 100];
}

function hsl2rgb(hsl) {
    var h = hsl[0] / 360,
        s = hsl[1] / 100,
        l = hsl[2] / 100;
    var r, g, b;
    if (!s) {
        r = g = b = l;
    } else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return [r * 255, g * 255, b * 255];
}

function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
}

function rgb2hsv(rgb) {
    var r = rgb[0] / 255,
        g = rgb[1] / 255,
        b = rgb[2] / 255,
        max = Math.max(r, g, b),
        min = Math.min(r, g, b),
        h, s, v = max,
        d = max - min;

    s = max === 0 ? 0 : d / max;
    if (max === min) {
        h = 0;
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h = h * 60;
    }
    return [h || 0, s * 100, v * 100];
}

function hsv2rgb(hsv) {
    var h = hsv[0] / 60,
        s = hsv[1] / 100,
        v = hsv[2] / 100;

    var hi = Math.floor(h) % 6,
        f = h - Math.floor(h),
        p = v * (1 - s),
        q = v * (1 - f * s),
        t = v * (1 - (1 - f) * s),
        r, g, b;

    switch (hi) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    return [r * 255, g * 255, b * 255];
}

function rgb2cmyk(rgb) {
    var r = rgb[0] / 255,
        g = rgb[1] / 255,
        b = rgb[2] / 255,
        k = 1 - Math.max(r, g, b),
        c = (1 - r - k) / (1 - k) || 0,
        m = (1 - g - k) / (1 - k) || 0,
        y = (1 - b - k) / (1 - k) || 0;
    return [c * 100, m * 100, y * 100, k * 100];
}

function cmyk2rgb(cmyk) {
    var c = cmyk[0] / 100,
        m = cmyk[1] / 100,
        y = cmyk[2] / 100,
        k = cmyk[3] / 100;

    var r = 1 - Math.min(1, c * (1 - k) + k),
        g = 1 - Math.min(1, m * (1 - k) + k),
        b = 1 - Math.min(1, y * (1 - k) + k);

    return [r * 255, g * 255, b * 255];
}

function rgb2keyword(rgb) {
    var best = null;
    var d = Infinity;
    for (var k in cssKeywords) {
        var c = cssKeywords[k];
        var dist = (rgb[0] - c[0]) * (rgb[0] - c[0]) +
            (rgb[1] - c[1]) * (rgb[1] - c[1]) +
            (rgb[2] - c[2]) * (rgb[2] - c[2]);
        if (dist < d) {
            d = dist;
            best = k;
        }
    }
    return best;
}

function keyword2rgb(keyword) {
    return cssKeywords[keyword];
}

module.exports = {
    rgb2hsl: rgb2hsl,
    hsl2rgb: hsl2rgb,
    rgb2hsv: rgb2hsv,
    hsv2rgb: hsv2rgb,
    rgb2cmyk: rgb2cmyk,
    cmyk2rgb: cmyk2rgb,
    rgb2keyword: rgb2keyword,
    keyword2rgb: keyword2rgb
};