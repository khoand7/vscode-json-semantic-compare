export function compareObjects(obj1: any, obj2: any): any {
    const differences: any = {};

    function compare(currentObj1: any, currentObj2: any, path: string) {
        for (const key in currentObj1) {
            if (currentObj1.hasOwnProperty(key)) {
                const newPath = path ? `${path}.${key}` : key;

                if (typeof currentObj1[key] === 'object' && currentObj1[key] !== null && typeof currentObj2[key] === 'object' && currentObj2[key] !== null) {
                    compare(currentObj1[key], currentObj2[key], newPath);
                } else if (currentObj1[key] !== currentObj2[key]) {
                    differences[newPath] = {
                        value1: currentObj1[key],
                        value2: currentObj2[key]
                    };
                }
            }
        }

        for (const key in currentObj2) {
            if (currentObj2.hasOwnProperty(key) && !currentObj1.hasOwnProperty(key)) {
                const newPath = path ? `${path}.${key}` : key;
                differences[newPath] = {
                    value1: undefined,
                    value2: currentObj2[key]
                };
            }
        }
    }

    compare(obj1, obj2, '');
    return differences;
}