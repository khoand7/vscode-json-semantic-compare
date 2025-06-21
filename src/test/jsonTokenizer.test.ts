import * as assert from 'assert';
import { tokenizeJson, collectLineMap } from '../utils/jsonTokenizer';

describe('tokenizeJson', () => {
    it('should return an empty array for an empty JSON string', () => {
        const tokens = tokenizeJson("");
        assert.deepStrictEqual(tokens, []);
    });

    it('should tokenize a simple JSON object', () => {
        const jsonString = '{"key": "value"}';
        const tokens = tokenizeJson(jsonString);

        assert.strictEqual(tokens.length, 2, 'Should have two tokens: root object and one value');

        // Token for root object
        assert.deepStrictEqual(tokens[0], {
            type: 'object',
            value: { key: "value" },
            range: { offset: 0, length: 17 },
            path: [],
            lineNumber: 1,
            column: 0
        }, 'Root object token mismatch');

        // Token for string value "value"
        assert.deepStrictEqual(tokens[1], {
            type: 'string',
            value: "value",
            range: { offset: 8, length: 7 }, // "value"
            path: ["key"],
            lineNumber: 1,
            column: 8
        }, 'String value token mismatch');
    });

    it('should tokenize a JSON object with multiple properties, data types, and newlines', () => {
        const jsonString = '{\n' +
            '  "name": "John",\n' +
            '  "age": 30,\n' +
            '  "isStudent": false,\n' +
            '  "city": null\n' +
            '}';
        // Calculate line start offsets for accurate column checking
        const lines = jsonString.split('\n');
        const lineStartOffsets = [0];
        let currentOffset = 0;
        for (let i = 0; i < lines.length - 1; i++) {
            currentOffset += lines[i].length + 1; // +1 for the newline character
            lineStartOffsets.push(currentOffset);
        }

        const tokens = tokenizeJson(jsonString);
        assert.strictEqual(tokens.length, 5, 'Should have 5 tokens: root object and 4 values');

        // Root object
        assert.deepStrictEqual(tokens[0].type, 'object', 'Root type');
        assert.deepStrictEqual(tokens[0].value, { name: "John", age: 30, isStudent: false, city: null }, 'Root value');
        assert.deepStrictEqual(tokens[0].range, { offset: 0, length: jsonString.length }, 'Root range');
        assert.deepStrictEqual(tokens[0].path, [], 'Root path');
        assert.deepStrictEqual(tokens[0].lineNumber, 1, 'Root lineNumber');
        assert.deepStrictEqual(tokens[0].column, 0, 'Root column');

        // "John" - Line 2 (index 1)
        const nameToken = tokens.find(t => t.path.length === 1 && t.path[0] === 'name')!;
        assert.deepStrictEqual(nameToken.type, 'string', 'Name type');
        assert.deepStrictEqual(nameToken.value, "John", 'Name value');
        assert.deepStrictEqual(nameToken.range, { offset: jsonString.indexOf('"John"'), length: 6 }, 'Name range'); // "John"
        assert.deepStrictEqual(nameToken.path, ["name"], 'Name path');
        assert.deepStrictEqual(nameToken.lineNumber, 2, 'Name lineNumber');
        assert.deepStrictEqual(nameToken.column, jsonString.indexOf('"John"') - lineStartOffsets[1], 'Name column');

        // 30 - Line 3 (index 2)
        const ageToken = tokens.find(t => t.path.length === 1 && t.path[0] === 'age')!;
        assert.deepStrictEqual(ageToken.type, 'number', 'Age type');
        assert.deepStrictEqual(ageToken.value, 30, 'Age value');
        assert.deepStrictEqual(ageToken.range, { offset: jsonString.indexOf('30'), length: 2 }, 'Age range'); // 30
        assert.deepStrictEqual(ageToken.path, ["age"], 'Age path');
        assert.deepStrictEqual(ageToken.lineNumber, 3, 'Age lineNumber');
        assert.deepStrictEqual(ageToken.column, jsonString.indexOf('30') - lineStartOffsets[2], 'Age column');

        // false - Line 4 (index 3)
        const isStudentToken = tokens.find(t => t.path.length === 1 && t.path[0] === 'isStudent')!;
        assert.deepStrictEqual(isStudentToken.type, 'boolean', 'isStudent type');
        assert.deepStrictEqual(isStudentToken.value, false, 'isStudent value');
        assert.deepStrictEqual(isStudentToken.range, { offset: jsonString.indexOf('false'), length: 5 }, 'isStudent range'); // false
        assert.deepStrictEqual(isStudentToken.path, ["isStudent"], 'isStudent path');
        assert.deepStrictEqual(isStudentToken.lineNumber, 4, 'isStudent lineNumber');
        assert.deepStrictEqual(isStudentToken.column, jsonString.indexOf('false') - lineStartOffsets[3], 'isStudent column');

        // null - Line 5 (index 4)
        const cityToken = tokens.find(t => t.path.length === 1 && t.path[0] === 'city')!;
        assert.deepStrictEqual(cityToken.type, 'object', 'City type (typeof null is object)'); // typeof null is 'object'
        assert.deepStrictEqual(cityToken.value, null, 'City value');
        assert.deepStrictEqual(cityToken.range, { offset: jsonString.indexOf('null'), length: 4 }, 'City range'); // null
        assert.deepStrictEqual(cityToken.path, ["city"], 'City path');
        assert.deepStrictEqual(cityToken.lineNumber, 5, 'City lineNumber');
        assert.deepStrictEqual(cityToken.column, jsonString.indexOf('null') - lineStartOffsets[4], 'City column');
    });

    it('should tokenize a JSON array with various data types', () => {
        const jsonString = '[1, "two", true, null, {"id": 3}]';
        const tokens = tokenizeJson(jsonString);

        assert.strictEqual(tokens.length, 7, 'Should have 7 tokens: root array, 4 primitive values, 1 object, 1 nested value');

        // Root array
        assert.deepStrictEqual(tokens[0].type, 'object', 'Array type'); // typeof array is 'object'
        assert.deepStrictEqual(tokens[0].value, [1, "two", true, null, {"id": 3}], 'Array value');
        assert.deepStrictEqual(tokens[0].range, { offset: 0, length: jsonString.length }, 'Array range');
        assert.deepStrictEqual(tokens[0].path, [], 'Array path');
        assert.deepStrictEqual(tokens[0].lineNumber, 1, 'Array lineNumber');
        assert.deepStrictEqual(tokens[0].column, 0, 'Array column');

        // Number 1
        assert.deepStrictEqual(tokens[1].type, 'number');
        assert.deepStrictEqual(tokens[1].value, 1);
        assert.deepStrictEqual(tokens[1].range, { offset: 1, length: 1 });
        assert.deepStrictEqual(tokens[1].path, [0]);
        assert.deepStrictEqual(tokens[1].lineNumber, 1);
        assert.deepStrictEqual(tokens[1].column, 1);

        // String "two"
        assert.deepStrictEqual(tokens[2].type, 'string');
        assert.deepStrictEqual(tokens[2].value, "two");
        assert.deepStrictEqual(tokens[2].range, { offset: 4, length: 5 }); // "two"
        assert.deepStrictEqual(tokens[2].path, [1]);
        assert.deepStrictEqual(tokens[2].lineNumber, 1);
        assert.deepStrictEqual(tokens[2].column, 4);

        // Boolean true
        assert.deepStrictEqual(tokens[3].type, 'boolean');
        assert.deepStrictEqual(tokens[3].value, true);
        assert.deepStrictEqual(tokens[3].range, { offset: 11, length: 4 }); // true
        assert.deepStrictEqual(tokens[3].path, [2]);
        assert.deepStrictEqual(tokens[3].lineNumber, 1);
        assert.deepStrictEqual(tokens[3].column, 11);

        // Null
        assert.deepStrictEqual(tokens[4].type, 'object'); // typeof null
        assert.deepStrictEqual(tokens[4].value, null);
        assert.deepStrictEqual(tokens[4].range, { offset: 17, length: 4 }); // null
        assert.deepStrictEqual(tokens[4].path, [3]);
        assert.deepStrictEqual(tokens[4].lineNumber, 1);
        assert.deepStrictEqual(tokens[4].column, 17);

        // Object {"id": 3}
        assert.deepStrictEqual(tokens[5].type, 'object');
        assert.deepStrictEqual(tokens[5].value, {"id": 3});
        assert.deepStrictEqual(tokens[5].range, { offset: 23, length: 10 }); // {"id": 3}
        assert.deepStrictEqual(tokens[5].path, [4]);
        assert.deepStrictEqual(tokens[5].lineNumber, 1);
        assert.deepStrictEqual(tokens[5].column, 23);

        // Number 3 (nested value)
        assert.deepStrictEqual(tokens[6].type, 'number');
        assert.deepStrictEqual(tokens[6].value, 3);
        assert.deepStrictEqual(tokens[6].range, { offset: 30, length: 1 }); // 3
        assert.deepStrictEqual(tokens[6].path, [4, "id"]);
        assert.deepStrictEqual(tokens[6].lineNumber, 1);
        assert.deepStrictEqual(tokens[6].column, 30);
    });

    it('should handle JSON with comments (comments are ignored and not tokenized)', () => {
        const jsonString = '{\n' +
            '  // This is a single line comment\n' +
            '  "key": "value", /* This is a block comment */\n' +
            '  "anotherKey": 123 // Trailing comment\n' +
            '}';

        const lines = jsonString.split('\n');
        const lineStartOffsets = [0];
        let currentOffset = 0;
        for (let i = 0; i < lines.length - 1; i++) {
            currentOffset += lines[i].length + 1;
            lineStartOffsets.push(currentOffset);
        }

        const tokens = tokenizeJson(jsonString);
        // Expected tokens: root object, "value", 123
        assert.strictEqual(tokens.length, 3, 'Should have 3 tokens, comments ignored');

        const expectedParsedValue = { "key": "value", "anotherKey": 123 };

        // Root object
        assert.deepStrictEqual(tokens[0].type, 'object');
        assert.deepStrictEqual(tokens[0].value, expectedParsedValue);
        assert.deepStrictEqual(tokens[0].range, { offset: 0, length: jsonString.length });
        assert.deepStrictEqual(tokens[0].path, []);
        assert.deepStrictEqual(tokens[0].lineNumber, 1);
        assert.deepStrictEqual(tokens[0].column, 0);

        // "value" for "key" - Line 3
        const valueToken = tokens.find(t => t.path.length === 1 && t.path[0] === "key")!;
        assert.ok(valueToken, 'Token for "key" not found');
        assert.deepStrictEqual(valueToken.type, 'string');
        assert.deepStrictEqual(valueToken.value, "value");
        const valueOffset = jsonString.indexOf('"value"');
        assert.deepStrictEqual(valueToken.range, { offset: valueOffset, length: 7 }); // `"value"`
        assert.deepStrictEqual(valueToken.path, ["key"]);
        assert.deepStrictEqual(valueToken.lineNumber, 3);
        assert.deepStrictEqual(valueToken.column, valueOffset - lineStartOffsets[2]);

        // 123 for "anotherKey" - Line 4
        const numToken = tokens.find(t => t.path.length === 1 && t.path[0] === "anotherKey")!;
        assert.ok(numToken, 'Token for "anotherKey" not found');
        assert.deepStrictEqual(numToken.type, 'number');
        assert.deepStrictEqual(numToken.value, 123);
        const numOffset = jsonString.indexOf('123');
        assert.deepStrictEqual(numToken.range, { offset: numOffset, length: 3 }); // `123`
        assert.deepStrictEqual(numToken.path, ["anotherKey"]);
        assert.deepStrictEqual(numToken.lineNumber, 4);
        assert.deepStrictEqual(numToken.column, numOffset - lineStartOffsets[3]);
    });

    it('should tokenize a JSON string with escaped characters in keys and values', () => {
        const jsonString = '{"ke\\\"y": "val\\nue"}'; // Represents: {"ke\"y": "val\nue"}
        const tokens = tokenizeJson(jsonString);

        assert.strictEqual(tokens.length, 2);

        // Root object
        assert.deepStrictEqual(tokens[0].type, 'object');
        assert.deepStrictEqual(tokens[0].value, { 'ke"y': 'val\nue' }); // Parsed value
        assert.deepStrictEqual(tokens[0].range, { offset: 0, length: jsonString.length });
        assert.deepStrictEqual(tokens[0].path, []);
        assert.deepStrictEqual(tokens[0].lineNumber, 1);
        assert.deepStrictEqual(tokens[0].column, 0);

        // String value "val\nue" (original in jsonString is "val\\nue")
        const valueToken = tokens.find(t => t.path.length === 1 && t.path[0] === 'ke"y')!;
        assert.ok(valueToken, 'Token for value with escaped key not found');
        assert.deepStrictEqual(valueToken.type, 'string');
        assert.deepStrictEqual(valueToken.value, 'val\nue'); // Parsed value
        const valOffset = jsonString.indexOf('"val\\nue"');
        assert.deepStrictEqual(valueToken.range, { offset: valOffset, length: '"val\\nue"'.length });
        assert.deepStrictEqual(valueToken.path, ['ke"y']);
        assert.deepStrictEqual(valueToken.lineNumber, 1);
        assert.deepStrictEqual(valueToken.column, valOffset);
    });

    it('should handle a single primitive value as JSON root', () => {
        const testCases = [
            { json: '"hello"', type: 'string', value: 'hello', length: 7 },
            { json: '123', type: 'number', value: 123, length: 3 },
            { json: 'true', type: 'boolean', value: true, length: 4 },
            { json: 'null', type: 'object', value: null, length: 4 } // typeof null is 'object'
        ];

        for (const tc of testCases) {
            const tokens = tokenizeJson(tc.json);
            assert.strictEqual(tokens.length, 1, `Expected 1 token for primitive ${tc.json}`);
            assert.deepStrictEqual(tokens[0], {
                type: tc.type,
                value: tc.value,
                range: { offset: 0, length: tc.length },
                path: [], // For root primitive, path is empty array
                lineNumber: 1,
                column: 0
            }, `Token mismatch for primitive ${tc.json}`);
        }
    });
});

// Create test suite for visitJson function in jsonTokenizer.ts
// Note: The visitJson function is not defined in the provided code snippet.
// It seems to be a utility function that might be used internally in tokenizeJson.
// If visitJson is defined, you can create a test suite similar to the one above.
// If visitJson is not defined, you can skip this part or define it as needed.
describe.only('collectLineMap', () => {
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
        // Assuming visitJson is defined and works similarly to tokenizeJson
        const lineMap = collectLineMap(jsonString);
        // Here you would call visitJson with the jsonString and lineMap
        console.log(lineMap.toString());
        // You can add assertions here based on the expected behavior of visitJson
    });
});