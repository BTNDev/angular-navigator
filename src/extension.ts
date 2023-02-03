import { existsSync } from 'fs';
import { join, parse as parsePath } from 'path';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('angular-navigator.switchTo', async () => {
		const uriString = vscode.window.activeTextEditor?.document.uri.path;

		if (uriString === undefined) {
			vscode.window.showInformationMessage('No file opened!');
			return;
		}

		const path = parsePath(uriString);
		path.name = path.name.replace('.spec', '');

		const options: string[] = [];

		const extensions = ['ts', 'html', 'css', 'spec.ts'];
		for (let i = 0; i < extensions.length; i++) {
			const ext = extensions[i];

			if (path.base !== `${path.name}.${ext}` &&
				existsSync(join(path.dir, `${path.name}.${ext}`))) {
				options.push(`${path.name}.${ext}`);
			}
		}
		const result = await vscode.window.showQuickPick(options);

		if (result === undefined) {
			return;
		}

		const targetToOpen = join(path.dir, result);

		try {
			const doc = await vscode.workspace.openTextDocument(targetToOpen);
			vscode.commands.executeCommand('workbench.action.closeActiveEditor');
			vscode.window.showTextDocument(doc, { preview: false });
		} catch (error) {
			if (error instanceof Error) {
				vscode.window.showInformationMessage(error.message);
			}
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }