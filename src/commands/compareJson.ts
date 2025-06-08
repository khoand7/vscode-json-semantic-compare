import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { compareObjects } from '../utils/jsonComparer';

export async function compareJson(uri1: vscode.Uri, uri2: vscode.Uri) {
    if (uri1 && uri2) {
        const filePath1 = uri1.fsPath;
        const filePath2 = uri2.fsPath;

        try {
            const json1 = JSON.parse(fs.readFileSync(filePath1, 'utf8'));
            const json2 = JSON.parse(fs.readFileSync(filePath2, 'utf8'));

            const differences = compareObjects(json1, json2);

            // TODO write report to OUTPUT channel
            if (Object.keys(differences).length > 0) {
                vscode.window.showInformationMessage('Differences found: ' + JSON.stringify(differences, null, 2));
            } else {
                vscode.window.showInformationMessage('The JSON files are semantically identical.');
            }
        } catch (error) {
            vscode.window.showErrorMessage('Error reading or parsing JSON files: ' + String(error));
        }
    }
}