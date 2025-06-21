import * as assert from 'assert';
import {collectLineMap } from '../utils/jsonTokenizer';

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
});