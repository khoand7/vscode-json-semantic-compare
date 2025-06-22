import * as assert from 'assert';
import { collectLineMap } from '../utils/jsonTokenizer';
import { LineMap, Path } from '../types';

describe('collectLineMap', () => {
    it('should visit nodes in a JSON string', () => {
        const jsonString = `{
            "key": "value",
            "number": 42,
            "testObject": {
                "nestedKey": "nestedValue",
                "nestObject": {
                    "deepKey": "deepValue"
                }
            },
            "array": [1, 2, 3],
            "boolean": true,
            "null": null
        }`;
        // Assuming collectLineMap is defined and works similarly to tokenizeJson
        const lineMap = collectLineMap(jsonString);
        // Here you would call collectLineMap with the jsonString and lineMap
        console.log(lineMap.toString());
        // You can add assertions here based on the expected behavior of collectLineMap
    });

    // add more tests for LineMap functionality
    it('should create a LineMap and check for entries', () => {
        const jsonString = `{
            "key": "value",
            "number": 42,
            "testObject": {
                "nestedKey": "nestedValue",
                "nestObject": {
                    "deepKey": "deepValue"
                }
            },
            "array": [1, 2, 3],
            "boolean": true,
            "null": null
        }`;
        const lineMap = collectLineMap(jsonString);
        assert.ok(lineMap.has(new Path(['key'])));
        assert.ok(lineMap.has(new Path(['testObject', 'nestedKey'])));
        assert.ok(lineMap.has(new Path(['testObject', 'nestObject', 'deepKey'])));
        assert.ok(lineMap.has(new Path(['array', 0])));
        assert.ok(lineMap.has(new Path(['boolean'])));
        assert.ok(lineMap.has(new Path(['null'])));
        assert.ok(lineMap.has('$')); // Check for root path
        assert.ok(lineMap.has('$.testObject.nestObject.deepKey')); // Check for root path as empty array

        Array.from(lineMap.entries()).forEach(entry => {
            assert.ok(entry.path instanceof Path, 'Path should be an instance of Path');
            assert.ok(typeof entry.lineNumber === 'number', 'Line number should be a number');
            assert.ok(typeof entry.column === 'number', 'Column should be a number');
            assert.ok(entry.lineNumber > 0, 'Line number should be greater than 0');
            assert.ok(entry.column > 0, 'Column should be greater than 0');
            assert.ok(entry.path.toString().length > 0, 'Path string should not be empty');
            assert.ok(entry.path.toString().startsWith('$'), 'Path string should start with $');
        });

        let rootEntry = lineMap.get?.(new Path([]));
        if (rootEntry) {
            assert.ok(rootEntry, 'Root path should return an entry');
            assert.strictEqual(rootEntry?.lineNumber, 1, 'Root path should be on line 1');
            assert.strictEqual(rootEntry?.column, 1, 'Root path should start at column 1');
        } else {
            assert.fail('lineMap.get is not defined or did not return an entry');
        }

        rootEntry = lineMap.get('$');
        if (rootEntry) {
            assert.ok(rootEntry, 'Root path should return an entry');
            assert.strictEqual(rootEntry?.lineNumber, 1, 'Root path should be on line 1');
            assert.strictEqual(rootEntry?.column, 1, 'Root path should start at column 1');
        } else {
            assert.fail('lineMap.get is not defined or did not return an entry');
        }
    }
    );

    // collect lineMap with malformed JSON
    it('should handle malformed JSON gracefully', () => {       
        const jsonString = `{
            "key": "value",
            "number": 42,
            "testObject": {
                "nestedKey": "nestedValue",
                "nestObject": {
                    "deepKey": "deepValue"
                }
            },
            "array": [1, 2, 3],
            "boolean": true,
            "null": null,
            // Missing closing brace
        `;
        assert.throws(() => collectLineMap(jsonString), /Error: /);
    }
    );
});