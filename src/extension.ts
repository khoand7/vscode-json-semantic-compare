import * as vscode from 'vscode';
import { compareJson } from './commands/compareJson';

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
}

export function deactivate() {}