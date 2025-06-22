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
                // Show differences in a webview panel
                const panel = vscode.window.createWebviewPanel(
                    'jsonComparison',
                    'JSON Comparison',
                    vscode.ViewColumn.One,
                    { enableScripts: true }
                );

                let html = `<h2>Differences between ${path.basename(filePath1)} and ${path.basename(filePath2)}:</h2><ul>`;
                result.differences.forEach(diff => {
                    if (diff.type === JsonDiffType.Modified) {
                        html += `<li>
                            <b>Path:</b> ${diff.path}, <b>Type:</b> ${diff.type}, 
                            <b>Left Value:</b> ${JSON.stringify(diff.leftValue)}, 
                            <b>Right Value:</b> ${JSON.stringify(diff.rightValue)}
                        </li>`;
                    } else {
                        html += `<li>
                            <b>Path:</b> ${diff.path}, <b>Type:</b> ${diff.type}
                        </li>`;
                    }
                });
                html += `</ul>`;
                panel.webview.html = html;

                vscode.window.showInformationMessage('JSON files have differences. Check the JSON Comparison webview for details.');
            } else {
                vscode.window.showInformationMessage('The JSON files are semantically identical.');
            }
        } catch (error) {
            vscode.window.showErrorMessage('Error reading or parsing JSON files: ' + String(error));
        }
    }
}

export async function inspectPath(text: string) {
    const filePath = vscode.window.activeTextEditor?.document.uri.fsPath;
    const panel = vscode.window.createWebviewPanel(
        'jsonInspectPath',
        'JSON Paths and Locations',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );
    let html = `<h2>JSON Paths and their locations:</h2>`;
    try {
        const lineMap: LineMap = collectLineMap(text);
        if (lineMap.size === 0) {
            html += `<p>No JSON paths found in the provided text.</p>`;
        } else {
            html += `<ul>`;
            for (const entry of lineMap.entries()) {
                const { path, lineNumber, column } = entry as LineMapEntry;
                
                html += `<li>
                    <b>Path:</b> ${path}, <b>Line:</b> ${lineNumber + 1}, <b>Column:</b> ${column + 1}
                </li>`;
            }
            html += `</ul>`;
        }
    } catch (error) {
        html += `<p>Error inspecting JSON path: ${String(error)}</p>`;
    }
    panel.webview.html = html;
}