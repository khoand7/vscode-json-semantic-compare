import { stringify } from 'csv-stringify/sync';

export function jsonArrayToCsv(jsonString: string): string {
    try {
        const jsonArray = JSON.parse(jsonString);
        if (!Array.isArray(jsonArray)) {
            throw new Error("Input is not a valid JSON array.");
        }

        // Extract headers from the first object in the array
        // Loop all objects in the array to ensure all headers are captured
        const headersSet = new Set<string>();
        for (const obj of jsonArray) {
            if (typeof obj !== 'object' || obj === null) {
                throw new Error("All elements in the JSON array must be objects.");
            }
            Object.keys(obj).forEach(key => headersSet.add(key));
        }  

        // create csv string by using csv-stringify
        const headers = Array.from(headersSet);
        const options = {
            header: true,
            columns: headers,
            quoted: true, // Ensure all values are quoted
        };
        // need to wait for the stringify function to complete
        let result = stringify(jsonArray, options); 

        return result;
        
    } catch (error) {
        console.error("Error converting JSON array to CSV:", error);
        throw error;
    }
}

export function csvToJsonArray(csvString: string): any[] {
    // TODO Implement later
    return [];
}