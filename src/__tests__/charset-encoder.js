import CharsetEncoder from '../charset-encoder';
import {it, expect, describe} from '@jest/globals';

const alphabet = 'abcdefghijklmnopqrstuvwxyz';

describe('CharsetEncoder test suite', () => {
    describe('Charset validation tests', () => {
        it('should throw an error if charset is not provided', () => {
            expect(() => {
                new CharsetEncoder();
            }).toThrow(new Error('CharsetEncoder requires a charset to initialize'));
        });
        it('should throw an error if charset has duplicates', () => {
            expect(() => {
                new CharsetEncoder({
                    charset: 'aab'
                });
            }).toThrow(new Error('Charset cannot contain duplicate values'));
        });
    });
    describe('Mapping validation tests', () => {
        it('should throw an error if mapping contains non-numeric indexes', () => {
            expect(() => {
                new CharsetEncoder({
                    charset: 'abc',
                    mapping: 'a:c,b:a,c:b'
                });
            }).toThrow(new Error('Mapping contains invalid values'));
        });
        it('should throw an error if mapping contains out-of-bound indexes', () => {
            expect(() => {
                new CharsetEncoder({
                    charset: 'abc',
                    mapping: '-1:0,0:1,1:2'
                });
            }).toThrow(new Error('Mapping contains invalid values'));
            expect(() => {
                new CharsetEncoder({
                    charset: 'abc',
                    mapping: '4:0,0:1,1:2'
                });
            }).toThrow(new Error('Mapping cannot contain invalid indexes'));
        });
        it('should throw an error if mapping contains duplicate value references', () => {
            expect(() => {
                new CharsetEncoder({
                    charset: 'abc',
                    mapping: '0:1,1:2,2:1'
                });
            }).toThrow(new Error('Mapping cannot contain duplicate references'));
        });
        it('should throw an error if mapping contains duplicate key references', () => {
            expect(() => {
                new CharsetEncoder({
                    charset: 'abc',
                    mapping: '0:1,0:2,2:0'
                });
            }).toThrow(new Error('Mapping cannot contain duplicate references'));
        });
        it('should throw an error if mapping contains self references', () => {
            expect(() => {
                new CharsetEncoder({
                    charset: 'abc',
                    mapping: '0:0,1:2,2:1'
                });
            }).toThrow(new Error('Mapping cannot contain self-references'));
        });
        it('should throw an error if mapping doesn\'t match charset', () => {
            expect(() => {
                new CharsetEncoder({
                    charset: alphabet,
                    mapping: '0:1,1:0'
                });
            }).toThrow(new Error('Mapping does not match charset'));
        });
    });
    describe('Encoding & Decoding tests', () => {
        it('should encode a message with a random charset', () => {
            const msg = 'test';
            const encoder = new CharsetEncoder({
                charset: alphabet
            });
            const encoded = encoder.encode(msg);
            expect(encoded).not.toEqual(msg);
            expect(encoded.length).toEqual(msg.length);
        });
        it('should decode a message with a random charset', () => {
            const msg = 'test';
            const encoder = new CharsetEncoder({
                charset: alphabet
            });
            const encoded = encoder.encode(msg);
            const decoded = encoder.decode(encoded);
            expect(decoded).toEqual(msg);
        });
        it('should encode and decode a message with a provided charset', () => {
            const msg = 'abc';
            const charset = 'abc';
            const mapping = '0:2,1:0,2:1';
            const encoder = new CharsetEncoder({
                charset,
                mapping
            });
            const encoded = encoder.encode(msg);
            const decoded = encoder.decode(encoded);
            expect('cab').toEqual(encoded);
            expect(msg).toEqual(decoded);
        });
    });
    describe('Export & import tests', () => {
        it('should properly encode and decode a message with an imported mapping', () => {
            const msg = 'test';
            const mapping = '0:13,1:4,2:12,3:8,4:24,5:1,6:14,7:11,8:0,9:7,10:5,11:2,12:16,' +
                '13:3,14:21,15:20,16:19,17:15,18:17,19:9,20:18,21:6,22:10,23:25,24:23,25:22';
            const encoder = new CharsetEncoder({
                charset: alphabet,
                mapping
            });
            const expectedEncodedMsg = 'jyrj';
            const encoded = encoder.encode(msg);
            expect(encoded).toEqual(expectedEncodedMsg);
            const decoded = encoder.decode(encoded);
            expect(decoded).toEqual(msg);
        });
        it('should export a valid encode mapping', () => {
            const encoder = new CharsetEncoder({
                charset: alphabet
            });
            // exported map should match pattern 0:x,1:y,2:z...25:N
            const regex = new RegExp('^(\\d+:\\d+,){25}\\d+:\\d+$');
            const message = 'hello, world';
            for (let i = 0; i < 1000; i++) {
                // verify mapping validity
                const exportedMapping = encoder.exportMapping();
                expect(regex.test(exportedMapping)).toEqual(true);
                encoder.importMapping(exportedMapping);
                // verify message encoding / decoding
                const encoded = encoder.encode(message);
                const decoded = encoder.decode(encoded);
                expect(message).toEqual(decoded);
            }
        });
    });
});
