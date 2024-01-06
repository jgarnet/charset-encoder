/**
 * Encodes & decodes messages based on a supplied character set
 */
export default class CharsetEncoder {

    /**
     * Initializes CharsetEncoder.
     * If 'map' is supplied as an option, CharsetEncoder will be initialized based on the provided mapped values.
     * @param options
     */
    constructor(options) {
        if (!options || !options.charset) {
            throw new Error('CharsetEncoder requires a charset to initialize');
        }
        this.setCharset(options.charset);
        if (options.mapping) {
            this.importMapping(options.mapping);
        } else {
            this.generateMapping();
        }
    }

    setCharset(charset) {
        const chars = new Set();
        for (const c of charset) {
            if (chars.has(c)) {
                throw new Error('Charset cannot contain duplicate values');
            }
            chars.add(c);
        }
        this.charset = charset;
    }

    /**
     * Imports Map(N) from String with format key1:value1,key2:value2,...keyN:valueN.
     * Keys & Values must be numeric values.
     * @param mapStr
     */
    importMapping(mapStr) {
        // ensure mapping only contains numeric values, colons & commas
        if (/[^\d:,]/g.test(mapStr)) {
            throw new Error('Mapping contains invalid values');
        }
        // ensure number of pairs matches charset length
        const numberOfPairs = (mapStr.match(/\d+:\d+/g) || []).length;
        if (numberOfPairs !== this.charset.length) {
            throw new Error('Mapping does not match charset');
        }
        this.encodeMap = new Map();
        this.decodeMap = new Map();
        const entries = mapStr.split(',');
        for (const entry of entries) {
            const parts = entry.split(':');
            const key = Number(parts[0]);
            const value = Number(parts[1]);
            if (key > this.charset.length || value > this.charset.length) {
                throw new Error('Mapping cannot contain invalid indexes');
            }
            if (key === value) {
                throw new Error('Mapping cannot contain self-references');
            }
            // disallow duplicate mappings (i.e. 0:1,...23:1 or 0:1,0:2)
            if (this.encodeMap.has(key) || this.decodeMap.has(value)) {
                throw new Error('Mapping cannot contain duplicate references');
            }
            this.encodeMap.set(key, value);
            this.decodeMap.set(value, key);
        }
    }

    /**
     * Exports Map(N) as String with format key1:value1,key2:value2,...keyN:valueN.
     * Keys & Values will be numeric values.
     * @returns {string}
     */
    exportMapping() {
        let result = '';
        for (const entry of this.encodeMap.entries()) {
            result += `${entry[0]}:${entry[1]},`;
        }
        return result.substr(0, result.length - 1);
    }

    /**
     * Initializes internal encodeMap & decodeMap based on supplied charset.
     * Generates random key:value pairs to be used for encoding & decoding messages.
     */
    generateMapping() {
        this.encodeMap = new Map();
        this.decodeMap = new Map();
        // used to keep track of available potential key:value pairs as encode / decode Maps are populated
        const unusedKeys = [];
        const unusedValues = [];
        // keep track of possible indexes in charset
        for (let i = 0; i < this.charset.length; i++) {
            unusedKeys.push(i);
            unusedValues.push(i);
        }
        // populate encodeMap & decodeMap based on possible random unique pairs
        while (this.encodeMap.size < this.charset.length) {
            const keyIndex = this.getRandom(unusedKeys.length);
            const key = unusedKeys[keyIndex];
            const valueIndex = this.getRandom(unusedValues.length);
            const value = unusedValues[valueIndex];
            // skip iteration if key === value (self-reference) or key/value is already in a pair (collision)
            const shouldSkipIteration = key === value || this.encodeMap.has(key) || this.decodeMap.has(value);
            if (shouldSkipIteration) {
                continue;
            }
            this.encodeMap.set(key, value);
            this.decodeMap.set(value, key);
            // remove key & value from unusedKeys & unusedValues since they have been paired together
            unusedKeys.splice(keyIndex, 1);
            unusedValues.splice(valueIndex, 1);
        }
    }

    getRandom(max) {
        return Math.floor(Math.random() * max);
    }

    encode(msg) {
        return this.translate(msg, this.encodeMap);
    }

    decode(msg) {
        return this.translate(msg, this.decodeMap);
    }

    translate(msg, map) {
        let result = '';
        for (const c of msg) {
            const index = this.charset.indexOf(c);
            result += index !== -1 ? this.charset.charAt(map.get(index)) : c;
        }
        return result;
    }

}
