import { existsSync } from 'fs';
import { join, parse as parsePath } from 'path';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('angular-navigator.switchTo', async () => {
		const uriString = vscode.window.activeTextEditor?.document.uri.fsPath;

		if (uriString === undefined) {
			vscode.window.showInformationMessage('No file opened!');
			return;
		}

		const path = parsePath(uriString);
		path.name = path.name.replace('.spec', '');

		const options: string[] = [];

		const extensions = ['ts', 'html', 'css', 'scss', 'spec.ts'];
		for (let i = 0; i < extensions.length; i++) {
			const ext = extensions[i];

			if (path.base !== `${path.name}.${ext}` &&
				existsSync(join(path.dir, `${path.name}.${ext}`))) {
				options.push(`${path.name}.${ext}`);
			}
		}

		if (options.length === 0) {
			vscode.window.showInformationMessage('No files found!');
			return;
		}

		const result = await vscode.window.showQuickPick(options);

		if (result === undefined) {
			return;
		}

		const targetToOpen = join(path.dir, result);

		const desiredTabIndex = vscode.window.tabGroups.activeTabGroup.tabs.findIndex((tab) => tab.isActive);

		const doc = await vscode.workspace.openTextDocument(targetToOpen);
		vscode.commands.executeCommand('workbench.action.closeActiveEditor');
		await vscode.window.showTextDocument(doc, { preview: false });

		let tabIndex = vscode.window.tabGroups.activeTabGroup.tabs.findIndex((tab) => tab.isActive);

		const shift = tabIndex - desiredTabIndex;

		for (let i = 0; i < shift; i++) {
			vscode.commands.executeCommand('workbench.action.moveEditorLeftInGroup');
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }
