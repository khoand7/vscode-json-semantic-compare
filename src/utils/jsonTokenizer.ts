import { visit } from 'jsonc-parser';

import { 
    Path,
    LineMap,
} from '../types/index';

// create a visit(jsonString) function that will call visit function of jsonc-parser
export function collectLineMap(jsonString: string): LineMap {
    let lineMap = new LineMap();
    visit(jsonString, {
        onObjectBegin: (offset, length, startLine, startCharacter, pathSupplier) => {
            lineMap.set(
                new Path(pathSupplier()),
                startLine + 1, // Convert to 1-indexed line number
                startCharacter + 1 // Convert to 1-indexed column number
            );
        },
        onArrayBegin(offset, length, startLine, startCharacter, pathSupplier) {
            lineMap.set(
                new Path(pathSupplier()),
                startLine + 1, // Convert to 1-indexed line number
                startCharacter + 1 // Convert to 1-indexed column number
            );
        },
        onComment(offset, length, startLine, startCharacter) {
            // No action needed for comments in line map
        },
        onLiteralValue(value, offset, length, startLine, startCharacter, pathSupplier) {
            lineMap.set(
                new Path(pathSupplier()),
                startLine + 1, // Convert to 1-indexed line number
                startCharacter + 1 // Convert to 1-indexed column number
            );
        },
        onError(error, offset, length, startLine, startCharacter) {
            console.error(`Error: ${error} at offset ${offset}, length ${length}, startLine ${startLine}, startCharacter ${startCharacter}`);
            throw new Error(`JSON parsing error: ${error} at line ${startLine + 1}, column ${startCharacter + 1}`);
        },
    });
    return lineMap;
}

