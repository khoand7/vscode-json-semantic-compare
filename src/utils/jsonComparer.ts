import { JsonComparisonResult, JsonDiffType } from "../types";

export function compareObjects(obj1: any, obj2: any): JsonComparisonResult {
    const result: JsonComparisonResult = { differences: [] };

    function compare(currentObj1: any, currentObj2: any, path: string) {
        // If both objects are null or undefined, they are considered equal
        if (currentObj1 === null && currentObj2 === null) {
            return;
        }
        // If one of the objects is null or undefined, they are not equal
        if (currentObj1 === null || currentObj2 === null) {
            result.differences.push({ path, type: currentObj1 === null ? JsonDiffType.Added : JsonDiffType.Removed });
            return;
        }
        // If either object is array, we need to handle it differently
        if (Array.isArray(currentObj1) && Array.isArray(currentObj2)) {
            // Compare arrays by length first
            if (currentObj1.length !== currentObj2.length) {
                result.differences.push({ path, type: JsonDiffType.Modified, leftValue: currentObj1.length, rightValue: currentObj2.length });
                return;
            }
            // Compare each element in the arrays
            for (let i = 0; i < currentObj1.length; i++) {
                const newPath = path ? `${path}[${i}]` : `[${i}]`;
                if (typeof currentObj1[i] === 'object' && typeof currentObj2[i] === 'object') {
                    compare(currentObj1[i], currentObj2[i], newPath);
                } else if (currentObj1[i] !== currentObj2[i]) {
                    result.differences.push({ path: newPath, type: JsonDiffType.Modified, leftValue: currentObj1[i], rightValue: currentObj2[i] });
                }
            }
            return;
        }
        // If both are not objects, we can directly compare them
        if (typeof currentObj1 !== 'object' || typeof currentObj2 !== 'object' || currentObj1 === null || currentObj2 === null) {
            if (currentObj1 !== currentObj2) {
                result.differences.push({ path, type: JsonDiffType.Modified, leftValue: currentObj1, rightValue: currentObj2 });
            }
            return;
        }
        // If both are objects, we need to compare their keys
        // Check for keys in the first object that are not in the second 
        for (const key in currentObj1) {
            if (!currentObj1.hasOwnProperty(key)) {
                continue;
            }
            const newPath = path ? `${path}.${key}` : key;
            // Check if the key exists in the second object
            if (!currentObj2.hasOwnProperty(key)) {
                result.differences.push({ path: newPath, type: JsonDiffType.Removed });
                continue;
            }
        }
        // Check for keys in the second object that are not in the first
        for (const key in currentObj2) {
            if (!currentObj2.hasOwnProperty(key)) {
                continue;
            }
            const newPath = path ? `${path}.${key}` : key;
            // Check if the key exists in the first object
            if (!currentObj1.hasOwnProperty(key)) {
                result.differences.push({ path: newPath, type: JsonDiffType.Added });
                continue;
            }
            // If both objects have the key, compare their values
            const value1 = currentObj1[key];
            const value2 = currentObj2[key];
            if (typeof value1 === 'object' && typeof value2 === 'object') {
                compare(value1, value2, newPath);
            } else if (value1 !== value2) {
                result.differences.push({ path: newPath, type: JsonDiffType.Modified, leftValue: value1, rightValue: value2 });
            }
        }
    }

    compare(obj1, obj2, '');
    return result;
}