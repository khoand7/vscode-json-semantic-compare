import * as vscode from 'vscode';
import { compareJson, inspectPath } from './commands/compareJson';
import { jsonArrayToCsv, csvToJsonArray } from './utils/jsonCsv';

export function activate(context: vscode.ExtensionContext) {

    const compareJsonCommand = vscode.commands.registerCommand('jsonSemanticCompare.compareJson', (uri: vscode.Uri, uris: vscode.Uri[]) => {
        
        let fileUris: vscode.Uri[] = [];

        // Case 1: Files selected in Explorer
        if (uris && uris.length === 2) {
            fileUris = uris;
        }
        // Case 2: Two JSON files open in active editors
        else if (vscode.window.activeTextEditor) {
            const editors = vscode.window.visibleTextEditors
                .filter(editor => editor.document.languageId === 'json')
                .map(editor => editor.document.uri);
            
            if (editors.length === 2) {
                fileUris = editors;
            }
        }

        // Run comparison if we have two files
        if (fileUris.length === 2) {
            const [uri1, uri2] = fileUris;
            vscode.window.showInformationMessage(`Comparing JSON files:\n${uri1.fsPath}\n${uri2.fsPath}`);
            compareJson(uri1, uri2); // Call your function here
        } else {
            vscode.window.showErrorMessage("Please select or open exactly two JSON files.");
        }
    });

    context.subscriptions.push(compareJsonCommand);

    // Register inspectPath command
    const inspectPathCommand = vscode.commands.registerCommand('jsonSemanticCompare.inspectPath', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'json') {
            vscode.window.showErrorMessage('Please open a JSON file to inspect.');
            return;
        }
        let text = editor.document.getText(editor.selection);
        if (!text) {
            text = editor.document.getText(); // If no selection, inspect the whole document
        }

        inspectPath(text);
    });

    context.subscriptions.push(inspectPathCommand);

    // Register jsonArrayToCsv command
    const jsonArrayToCsvCommand = vscode.commands.registerCommand('jsonSemanticCompare.jsonArrayToCsv', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'json') {
            vscode.window.showErrorMessage('Please open a JSON file to convert.');
            return;
        }
        let text = editor.document.getText(editor.selection);
        if (!text) {
            text = editor.document.getText(); // If no selection, convert the whole document
        }

        const csvText = jsonArrayToCsv(text);
        if (!csvText) {
            vscode.window.showErrorMessage('Failed to convert JSON Array to CSV.');
            return;
        }
        // Create a new untitled CSV file and write the CSV text to it
        vscode.workspace.openTextDocument({ content: csvText, language: 'csv' }).then(doc => {
            vscode.window.showTextDocument(doc).then(() => {
                vscode.window.showInformationMessage('JSON Array successfully converted to CSV and opened in a new document.');
            }, err => {
                vscode.window.showErrorMessage(`Failed to open new CSV document: ${err.message}`);
            });
        }, err => {
            vscode.window.showErrorMessage(`Failed to create new CSV document: ${err.message}`);
        });
    });

    context.subscriptions.push(jsonArrayToCsvCommand);

    // Register jsonArrayToCsv command
    const csvToJsonArrayCommand = vscode.commands.registerCommand('jsonSemanticCompare.csvToJsonArray',  async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('Please open a CSV file to convert.');
            return;
        }
        let text = editor.document.getText(editor.selection);
        if (!text) {
            text = editor.document.getText(); // If no selection, convert the whole document
        }

        const jsonArray = csvToJsonArray(text);
        if (!jsonArray) {
            vscode.window.showErrorMessage('Failed to convert CSV to JSON Array.');
            return;
        }
        // Create a new untitled JSON file and write the JSON text to it
        vscode.workspace.openTextDocument({ content: JSON.stringify(jsonArray, null, 2), language: 'json' }).then(doc => {
            vscode.window.showTextDocument(doc).then(() => {
                vscode.window.showInformationMessage('CSV successfully converted to JSON Array and opened in a new document.');
            }, err => {
                vscode.window.showErrorMessage(`Failed to open new JSON document: ${err.message}`);
            });
        }, err => {
            vscode.window.showErrorMessage(`Failed to create new JSON document: ${err.message}`);
        });
        
    });

    context.subscriptions.push(csvToJsonArrayCommand);

}

export function deactivate() {}
