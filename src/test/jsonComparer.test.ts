const assert = require('assert');

// Generate test from the JSONComparer class
const { compareObjects } = require('../utils/jsonComparer');
const { JsonDiffType } = require('../types');

describe('JSONComparer', () => {
    // both objects are null
    it('should return no differences for two null objects', () => {
        const json1 = null;
        const json2 = null;
        const result = compareObjects(json1, json2);
        assert.deepStrictEqual(result.differences, []);
    });
    // one object is null
    it('should detect a difference when one object is null', () => {
        const json1 = null;
        const json2 = { "name": "John" };
        const result = compareObjects(json1, json2);
        assert.deepStrictEqual(result.differences, [{ "path": "", "type": JsonDiffType.Added }]);
    });
    it('should detect a difference when the other object is null', () => {
        const json1 = { "name": "John" };
        const json2 = null;
        const result = compareObjects(json1, json2);
        assert.deepStrictEqual(result.differences, [{ "path": "", "type": JsonDiffType.Removed }]);
    });
    // both objects are empty
    it('should return no differences for two empty objects', () => {
        const json1 = {};
        const json2 = {};
        const result = compareObjects(json1, json2);
        assert.deepStrictEqual(result.differences, []);
    });
    // use test data from test-files folder
    it('should compare two identical JSON objects', () => {
        const json1 = { "name": "John", "age": 30, "city": "New York" };
        const json2 = { "name": "John", "age": 30, "city": "New York" };
        const result = compareObjects(json1, json2);
        assert.deepStrictEqual(result.differences, []);
    });
    it('should detect added properties', () => {
        const json1 = { "name": "John", "age": 30 };
        const json2 = { "name": "John", "age": 30, "city": "New York" };
        const result = compareObjects(json1, json2);
        assert.deepStrictEqual(result.differences, [{ "path": "city", "type": JsonDiffType.Added }]);
    });
    it('should detect removed properties', () => {
        const json1 = { "name": "John", "age": 30, "city": "New York" };
        const json2 = { "name": "John", "age": 30 };
        const result = compareObjects(json1, json2);
        assert.deepStrictEqual(result.differences, [{ "path": "city", "type": JsonDiffType.Removed }]);
    });
    // Test for modified properties
    it('should detect modified properties', () => {
        const json1 = { "name": "John", "age": 30, "city": "New York" };
        const json2 = { "name": "John", "age": 31, "city": "Los Angeles" };
        const result = compareObjects(json1, json2);
        assert.deepStrictEqual(result.differences, [
            { "path": "age", "type": JsonDiffType.Modified, "leftValue": 30, "rightValue": 31 },
            { "path": "city", "type": JsonDiffType.Modified, "leftValue": "New York", "rightValue": "Los Angeles" }
        ]);
    });
    // Test for nested objects
    it('should compare nested JSON objects', () => {
        const json1 = { "name": "John", "address": { "city": "New York", "zip": "10001" } };
        const json2 = { "name": "John", "address": { "city": "Los Angeles", "zip": "90001" } };
        const result = compareObjects(json1, json2);
        assert.deepStrictEqual(result.differences, [
            { "path": "address.city", "type": JsonDiffType.Modified, "leftValue": "New York", "rightValue": "Los Angeles" },
            { "path": "address.zip", "type": JsonDiffType.Modified, "leftValue": "10001", "rightValue": "90001" }
        ]);
    }
    );
    // Test for arrays
    it('should compare JSON objects with arrays', () => {
        const json1 = { "name": "John", "hobbies": ["reading", "traveling"] };
        const json2 = { "name": "John", "hobbies": ["reading", "gaming"] };
        const result = compareObjects(json1, json2);
        assert.deepStrictEqual(result.differences, [
            { "path": "hobbies[1]", "type": JsonDiffType.Modified, "leftValue": "traveling", "rightValue": "gaming" }
        ]);
    }
    );
    // Test for arrays with different lengths
    it('should detect differences in array lengths', () => {
        const json1 = { "name": "John", "hobbies": ["reading", "traveling"] };
        const json2 = { "name": "John", "hobbies": ["reading", "gaming", "cooking"] };
        const result = compareObjects(json1, json2);
        assert.deepStrictEqual(result.differences, [
            { "path": "hobbies", "type": JsonDiffType.Modified, "leftValue": 2, "rightValue": 3 }
        ]);
    }
    );
    // Test for empty objects
    it('should handle empty JSON objects', () => {
        const json1 = {};
        const json2 = { "name": "John" };
        const result = compareObjects(json1, json2);
        assert.deepStrictEqual(result.differences, [{ "path": "name", "type": JsonDiffType.Added }]);
    }
    );
    // Test for null values
    it('should handle null values in JSON objects', () => {
        const json1 = { "name": "John", "age": null };
        const json2 = { "name": "John", "age": 30 };
        const result = compareObjects(json1, json2);
        assert.deepStrictEqual(result.differences, [
            { "path": "age", "type": JsonDiffType.Modified, "leftValue": null, "rightValue": 30 }
        ]);
    }
    );
    // Test for complex nested structures
    it('should handle complex nested structures', () => {
        const json1 = { "user": { "name": "John", "details": { "age": 30, "address": { "city": "New York" } } } };
        const json2 = { "user": { "name": "John", "details": { "age": 31, "address": { "city": "Los Angeles" } } } };
        const result = compareObjects(json1, json2);
        assert.deepStrictEqual(result.differences, [
            { "path": "user.details.age", "type": JsonDiffType.Modified, "leftValue": 30, "rightValue": 31 },
            { "path": "user.details.address.city", "type": JsonDiffType.Modified, "leftValue": "New York", "rightValue": "Los Angeles" }
        ]);
    }
    );
    // Test for complex objects with changed key orders
    it('should handle complex objects with changed key orders', () => {
        const json1 = { "user": { "name": "John", "age": 30, "city": "New York" } };
        const json2 = { "user": { "city": "New York", "age": 30, "name": "John" } };
        const result = compareObjects(json1, json2);
        assert.deepStrictEqual(result.differences, []);
    });
    // Test for objects in arrays
    it('should compare objects in arrays', () => {
        const json1 = { "users": [{ "name": "John", "age": 30 }, { "name": "Jane", "age": 25 }] };
        const json2 = { "users": [{ "name": "John", "age": 31 }, { "name": "Jane", "age": 25 }] };
        const result = compareObjects(json1, json2);
        assert.deepStrictEqual(result.differences, [
            { "path": "users[0].age", "type": JsonDiffType.Modified, "leftValue": 30, "rightValue": 31 }
        ]);
    });
    // Test for objects in arrays and array is root object
    it('should compare arrays as root objects', () => {     
        const json1 = [{ "name": "John", "age": 30 }, { "name": "Jane", "age": 25 }];
        const json2 = [{ "name": "John", "age": 31 }, { "name": "Jane", "age": 25 }];
        const result = compareObjects(json1, json2);
        assert.deepStrictEqual(result.differences, [
            { "path": "[0].age", "type": JsonDiffType.Modified, "leftValue": 30, "rightValue": 31 }
        ]);
    });
    // Test for keys in the second object that are not in the first
    it('should detect keys in the second object that are not in the first', () => {
        const json1 = { "name": "John", "age": 30 };
        const json2 = { "name": "John", "age": 30, "city": "New York" };
        const result = compareObjects(json1, json2);
        assert.deepStrictEqual(result.differences, [{ "path": "city", "type": JsonDiffType.Added }]);
    });
    it('should detect keys in the second object that are not in the first', () => {
        const json1 = { "name": "John", "age": 30 };
        const json2 = [ "name", "age" ];
        const result = compareObjects(json1, json2);
        assert.deepStrictEqual(result.differences, [
            { "path": "name", "type": JsonDiffType.Removed },
            { "path": "age", "type": JsonDiffType.Removed },
            { "path": "0", "type": JsonDiffType.Added }, // TODO: it should be path: ""
            { "path": "1", "type": JsonDiffType.Added }
        ]);
    });
    
});