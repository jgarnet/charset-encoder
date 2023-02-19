# Charset Encoder
Allows messages to be encoded and decoded using a provided charset. Randomized key:value pairs are used for encoding and can be exported/imported.

Mappings can be exported and imported to use for encoding and decoding messages using the format `k0:v0,k1:v1,...kN:vN` where:

- `N` is the total number of characters in the charset
- the charset is represented using integer indexes corresponding to each character in the set (i.e. from index 0 ... index N)
- a given `k` value is an index corresponding to a character in the charset, representing a 'key' entry in the mapping
- a given `v` value is an index corresponding to a character in the charset, representing a 'value' entry in the mapping
- a given `k:v` pair represents an inverse relationship between two characters in the charset (`charset[k] <-> charset[v]`)

For example, given a charset `abc` (`a -> 0, b -> 1, c -> 2`), the following mapping may be generated:

`0:2,1:0,2:1` meaning `a -> c, b -> a, c -> b` during encoding.

This mapping would result in a given message `cab` being encoded as `bca` (and consequently `bca` would decode as `cab`).

## Use
To use CharsetEncoder, a charset must be provided in the constructor's `options` parameter:

```javascript
const charsetEncoder = new CharsetEncoder({
    charset: 'abcdefghijklmnopqrstuvwxyz'
});
```

Messages can be encoded & decoded:

```javascript
const charsetEncoder = new CharsetEncoder({
    charset: 'abcdefghijklmnopqrstuvwxyz'
});

const encoded = charsetEncoder.encode('test');
console.log(encoded);
// example output --> erye

const decoded = charsetEncoder.decode(encoded);
console.log(decoded);
// output --> test
```

A charset can contain letters, numbers, and special characters -- for example, the following are all valid charsets:

```javascript
const charsetEncoderAlphabet = new CharsetEncoder({
    charset: 'abcdefghijklmnopqrstuvwxyz'
});

const charsetEncoderAlphanumeric = new CharsetEncoder({
    charset: 'abcdefghijklmnopqrstuvwxyz0123456789'
});

const charsetEncoderCustom = new CharsetEncoder({
    charset: '1234567890!@#$'
});
```
A predetermined mapping can be passed as an optional parameter to CharsetEncoder:

```javascript
const charsetEncoder = new CharsetEncoder({
    charset: 'abc',
    mapping: '0:2,1:0,2:1'
});

const encoded = charsetEncoder.encode('cab');
console.log(encoded);
// output -> bca

const decoded = charsetEncoder.decode('bca');
console.log(decoded);
// output -> cab
```

Mappings can be exported for later use:
```javascript
const charsetEncoder = new CharsetEncoder({
    charset: 'abc'
});
const mapping = charsetEncoder.exportMapping();
console.log(mapping);
// example output -> 0:2,1:0,2:1
```
