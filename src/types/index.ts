import {
    JSONPath
} from 'jsonc-parser';

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

// A class that wraps JSONPath and provides utility methods
export class Path {
    private path: string;

    constructor(path: JSONPath = []) {
        // Create string from input JSONPath following the RFC 6901 specification
        if (!Array.isArray(path)) {
            throw new Error('Path must be an array of strings or numbers');
        }
        if (path.length === 0) {
            this.path = '$'; // Root path
            return;
        }
        // Convert each segment to a string representation
        // where numbers are wrapped in square brackets and strings are left as is
        // Add the $ prefix to indicate the root of the JSON document
        this.path = '$.' + path.map(seg => (typeof seg === 'number' ? `[${seg}]` : seg)).join('.');
    }

    toString(): string {
        return this.path;
    }
}

export interface LineMapEntry {
    path: Path; // Path to the JSON node
    lineNumber: number; // 1-indexed line number
    column: number; // 1-indexed column number
}

export class LineMap {
    private map: Map<string, LineMapEntry>;

    constructor() {
        this.map = new Map<string, LineMapEntry>();
    }

    set(path: Path, lineNumber: number, column: number): void {
        const key = path.toString();
        this.map.set(key, { path, lineNumber, column });
    }

    get(path: Path | string): LineMapEntry | undefined {
        if (typeof path === 'string') {
            return this.map.get(path);
        } else {
            return this.map.get(path.toString());
        }
    }

    has(path: Path | string): boolean {
        if (typeof path === 'string') {
            return this.map.has(path);
        } else {
            return this.map.has(path.toString());
        }
    }

    entries(): IterableIterator<LineMapEntry> {
        return this.map.values();
    }

    toString(): string {
        return Array.from(this.map.values())
            .map(entry => `${entry.path.toString()} at line ${entry.lineNumber}, column ${entry.column}`)
            .join('\n');
    }

}