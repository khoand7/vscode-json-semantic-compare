export interface JsonObject {
    [key: string]: any;
}
export enum JsonDiffType {
    None = 'none',
    Added = 'added',
    Removed = 'removed',
    Modified = 'modified',
}
export interface JsonDiffResult {
    path: string;
    type: JsonDiffType;
    leftValue?: any; // Value in the first JSON object
    rightValue?: any; // Value in the second JSON object
}
export interface JsonComparisonResult {
    differences: JsonDiffResult[];
}