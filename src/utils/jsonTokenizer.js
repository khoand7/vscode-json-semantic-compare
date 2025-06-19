import { parse } from 'jsonc-parser';

export function tokenizeJson(jsonString) {
  const tokens = [];
  let offset = 0;
  let lineNumber = 1;
  let lineStartOffset = 0;

  parse(jsonString, (error, range, value, parent, path) => {
    const start = range.offset;
    const end = range.offset + range.length;

    // Calculate line number and column
    while (offset < start) {
      if (jsonString[offset] === '\n') {
        lineNumber++;
        lineStartOffset = offset + 1;
      }
      offset++;
    }
    const column = start - lineStartOffset;

    tokens.push({
      type: typeof value,
      value: value,
      range: range,
      path: path,
      lineNumber: lineNumber,
      column: column,
    });
  });

  return tokens;
}
