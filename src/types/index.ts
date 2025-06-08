export interface JsonObject {
    [key: string]: any;
}

export interface JsonComparisonResult {
    differences: Array<{ path: string; value1: any; value2: any }>;
    areEqual: boolean;
}