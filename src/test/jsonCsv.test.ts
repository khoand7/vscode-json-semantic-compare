import { expect } from 'chai';
import { jsonArrayToCsv, csvToJsonArray } from '../utils/jsonCsv';

describe('jsonArrayToCsv', () => {
    it('should convert a simple JSON array to CSV', () => {
        const json = JSON.stringify([
            { name: "Alice", age: 30 },
            { name: "Bob", age: 25 }
        ]);
        const csv = jsonArrayToCsv(json);
        expect(csv).to.include('"name","age"');
        expect(csv).to.include('"Alice","30"');
        expect(csv).to.include('"Bob","25"');
    });

    it('should include all headers from all objects', () => {
        const json = JSON.stringify([
            { a: 1, b: 2 },
            { a: 3, c: 4 }
        ]);
        const csv = jsonArrayToCsv(json);
        expect(csv).to.include('"a","b","c"');
        expect(csv).to.include('"1","2",');
        expect(csv).to.include('"3",,"4"');
    });

    it('should throw if input is not a JSON array', () => {
        const notArray = JSON.stringify({ foo: "bar" });
        expect(() => jsonArrayToCsv(notArray)).to.throw("Input is not a valid JSON array.");
    });

    it('should throw if any element is not an object', () => {
        const invalid = JSON.stringify([ { a: 1 }, 42 ]);
        expect(() => jsonArrayToCsv(invalid)).to.throw("All elements in the JSON array must be objects.");
    });

    it('should handle empty array', () => {
        const empty = JSON.stringify([]);
        const csv = jsonArrayToCsv(empty);
        expect(csv.trim()).to.equal('');
    });
});

// Generate test for CSV to JSON Array conversion
describe('csvToJsonArray', () => {
    it('empty', () => {
        const csv = '"name","age"\n"Alice","30"\n"Bob","25"';
        const jsonArray = csvToJsonArray(csv);
        expect(jsonArray).to.deep.equal([]);
        // TODO implement the test
    });
});