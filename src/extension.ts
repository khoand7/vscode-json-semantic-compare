import * as vscode from 'vscode';
import { compareJson, inspectPath } from './commands/compareJson';

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

    vscode.commands.registerCommand('jsonSemanticCompare.openFileAtLine', async (filePath: string, line: number, column: number) => {
        const uri = vscode.Uri.file(filePath);
        const doc = await vscode.workspace.openTextDocument(uri);
        const editor = await vscode.window.showTextDocument(doc);
        const pos = new vscode.Position(line, column);
        editor.selection = new vscode.Selection(pos, pos);
        editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter);
    });

}

export function deactivate() {}