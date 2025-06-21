import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { compareObjects } from '../utils/jsonComparer';
import { collectLineMap } from '../utils/jsonTokenizer';
import { JsonComparisonResult, JsonDiffType, LineMap, LineMapEntry } from '../types';

export async function compareJson(uri1: vscode.Uri, uri2: vscode.Uri) {
    if (uri1 && uri2) {
        const filePath1 = uri1.fsPath;
        const filePath2 = uri2.fsPath;

        try {
            const json1 = JSON.parse(fs.readFileSync(filePath1, 'utf8'));
            const json2 = JSON.parse(fs.readFileSync(filePath2, 'utf8'));

            const result: JsonComparisonResult = compareObjects(json1, json2);

            if (result.differences.length > 0) {
                // Write differences to a output channel
                const outputChannel = vscode.window.createOutputChannel('JSON Comparison');
                outputChannel.clear();
                outputChannel.appendLine(`Differences between ${path.basename(filePath1)} and ${path.basename(filePath2)}:`);
                result.differences.forEach(diff => {
                    if (diff.type === JsonDiffType.Modified) {
                        outputChannel.appendLine(`Path: ${diff.path}, Type: ${diff.type}, Left Value: ${diff.leftValue}, Right Value: ${diff.rightValue}`);
                    } else {
                        outputChannel.appendLine(`Path: ${diff.path}, Type: ${diff.type}`);
                    }
                });
                outputChannel.show();
                vscode.window.showInformationMessage('JSON files have differences. Check the output channel for details.');
            } else {
                vscode.window.showInformationMessage('The JSON files are semantically identical.');
            }
        } catch (error) {
            vscode.window.showErrorMessage('Error reading or parsing JSON files: ' + String(error));
        }
    }
}

export async function inspectPath(text: string) {
    const outputChannel = vscode.window.createOutputChannel('JSON Comparison');
    outputChannel.clear();
    try {
        const lineMap: LineMap = collectLineMap(text);
        if (lineMap.size === 0) {
            outputChannel.appendLine('No JSON paths found in the provided text.');
        } else {
            outputChannel.appendLine('JSON Paths and their locations:');
            for (const entry of lineMap.entries()) {
                const { path, lineNumber, column } = entry as LineMapEntry;
                // path as url that can be clicked on Output Channel
                // when clicked, it will open the file at the specified line and column
                const filePath = vscode.window.activeTextEditor?.document.uri.fsPath;   
                const commandUri = `command:jsonSemanticCompare.openFileAtLine?${encodeURIComponent(JSON.stringify([filePath, lineNumber, column]))}`;
                outputChannel.appendLine(`[Open](${commandUri})`);
            }
        }
    } catch (error) {
        outputChannel.appendLine('Error inspecting JSON path: ' + String(error));
    }
    outputChannel.show();
}