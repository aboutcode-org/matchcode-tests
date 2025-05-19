function SourceMapConsumer(map) {
    if (typeof map === 'string') {
        map = JSON.parse(map);
    }
    this._version = map.version;
    this._file = map.file || null;
    this._sources = [];
    this._names = [];
    this._sourceRoot = map.sourceRoot || null;
    this._mappings = map.mappings || '';
    this._sourcesContent = map.sourcesContent || null;
    for (var i = 0; i < map.sources.length; i++) {
        this._sources.push(map.sources[i]);
    }
    if (Array.isArray(map.names)) {
        for (var j = 0; j < map.names.length; j++) {
            this._names.push(map.names[j]);
        }
    }
    this._parsedMappings = null;
}

SourceMapConsumer.prototype._parseMappings = function() {
    if (this._parsedMappings) return;
    var mappings = [];
    var generatedLine = 1;
    var previousGeneratedColumn = 0;
    var previousSource = 0;
    var previousOriginalLine = 0;
    var previousOriginalColumn = 0;
    var previousName = 0;
    var i = 0;
    var str = this._mappings;
    var length = str.length;
    var base64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    function decodeVLQ() {
        var result = 0, shift = 0, value, cont, digit;
        do {
            if (i >= length) return null;
            digit = base64.indexOf(str.charAt(i++));
            cont = digit & 32;
            digit &= 31;
            result += digit << shift;
            shift += 5;
        } while (cont);
        value = result >> 1;
        return (result & 1) ? -value : value;
    }
    while (i < length) {
        var ch = str.charAt(i);
        if (ch === ';') {
            generatedLine++;
            previousGeneratedColumn = 0;
            i++;
        } else if (ch === ',') {
            i++;
        } else {
            var mapping = {};
            previousGeneratedColumn += decodeVLQ() || 0;
            mapping.generatedLine = generatedLine;
            mapping.generatedColumn = previousGeneratedColumn;
            if (str.charAt(i) && base64.indexOf(str.charAt(i)) !== -1) {
                previousSource += decodeVLQ() || 0;
                mapping.source = this._sources[previousSource];
                previousOriginalLine += decodeVLQ() || 0;
                mapping.originalLine = previousOriginalLine + 1;
                previousOriginalColumn += decodeVLQ() || 0;
                mapping.originalColumn = previousOriginalColumn;
                if (str.charAt(i) && base64.indexOf(str.charAt(i)) !== -1) {
                    previousName += decodeVLQ() || 0;
                    mapping.name = this._names[previousName];
                }
            }
            mappings.push(mapping);
        }
    }
    this._parsedMappings = mappings;
};

SourceMapConsumer.prototype.originalPositionFor = function(pos) {
    this._parseMappings();
    var line = pos.line;
    var column = pos.column;
    var mappings = this._parsedMappings;
    var left = 0, right = mappings.length - 1;
    var bestMatch = null;
    while (left <= right) {
        var mid = (left + right) >> 1;
        var mapping = mappings[mid];
        if (mapping.generatedLine < line || (mapping.generatedLine === line && mapping.generatedColumn <= column)) {
            bestMatch = mapping;
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    if (bestMatch && bestMatch.source !== undefined) {
        return {
            source: bestMatch.source,
            line: bestMatch.originalLine,
            column: bestMatch.originalColumn,
            name: bestMatch.name !== undefined ? bestMatch.name : null
        };
    }
    return { source: null, line: null, column: null, name: null };
};

SourceMapConsumer.prototype.generatedPositionFor = function(pos) {
    this._parseMappings();
    var mappings = this._parsedMappings;
    for (var i = 0; i < mappings.length; i++) {
        var mapping = mappings[i];
        if (
            mapping.source === pos.source &&
            mapping.originalLine === pos.line &&
            mapping.originalColumn === pos.column
        ) {
            return {
                line: mapping.generatedLine,
                column: mapping.generatedColumn
            };
        }
    }
    return { line: null, column: null };
};

SourceMapConsumer.prototype.hasContentsOfAllSources = function() {
    if (!this._sourcesContent) return false;
    if (this._sourcesContent.length !== this._sources.length) return false;
    for (var i = 0; i < this._sourcesContent.length; i++) {
        if (this._sourcesContent[i] == null) return false;
    }
    return true;
};

SourceMapConsumer.prototype.sourceContentFor = function(source) {
    if (!this._sourcesContent) return null;
    var idx = this._sources.indexOf(source);
    if (idx === -1) return null;
    return this._sourcesContent[idx];
};

SourceMapConsumer.prototype.sources = function() {
    return this._sources.slice();
};

window.SourceMapConsumer = SourceMapConsumer;