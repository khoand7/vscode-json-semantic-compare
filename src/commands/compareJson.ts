import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { compareObjects } from '../utils/jsonComparer';
import { JsonComparisonResult, JsonDiffType } from '../types';

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