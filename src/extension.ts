import * as vscode from 'vscode';
import { ClaudeCommitGenerator } from './commitGenerator';

let commitGenerator: ClaudeCommitGenerator;

export function activate(context: vscode.ExtensionContext) {
    console.log('Claude Commit extension is now active');

    commitGenerator = new ClaudeCommitGenerator();

    const disposable = vscode.commands.registerCommand(
        'claude-commit.generate',
        async () => {
            try {
                await generateCommitMessage();
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to generate commit message: ${error instanceof Error ? error.message : 'Unknown error'}`
                );
            }
        }
    );

    context.subscriptions.push(disposable);
}

async function generateCommitMessage() {
    const config = vscode.workspace.getConfiguration('claudeCommit');
    const apiKey = config.get<string>('apiKey');

    if (!apiKey) {
        const action = await vscode.window.showErrorMessage(
            'Anthropic API key is not configured. Please set your API key in settings.',
            'Open Settings'
        );

        if (action === 'Open Settings') {
            vscode.commands.executeCommand('workbench.action.openSettings', 'claudeCommit.apiKey');
        }
        return;
    }

    const gitExtension = vscode.extensions.getExtension('vscode.git');
    if (!gitExtension) {
        vscode.window.showErrorMessage('Git extension is not available');
        return;
    }

    const git = gitExtension.exports.getAPI(1);
    if (git.repositories.length === 0) {
        vscode.window.showErrorMessage('No Git repository found');
        return;
    }

    const repository = git.repositories[0];

    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: 'Generating commit message with Claude...',
            cancellable: false
        },
        async () => {
            const message = await commitGenerator.generateCommitMessage(repository);

            if (message) {
                const action = await vscode.window.showInformationMessage(
                    'Commit message generated!',
                    'Use Message',
                    'Edit & Use',
                    'Cancel'
                );

                if (action === 'Use Message') {
                    repository.inputBox.value = message;
                } else if (action === 'Edit & Use') {
                    const edited = await vscode.window.showInputBox({
                        value: message,
                        prompt: 'Edit commit message',
                        placeHolder: 'Enter commit message',
                        ignoreFocusOut: true
                    });

                    if (edited) {
                        repository.inputBox.value = edited;
                    }
                }
            }
        }
    );
}

export function deactivate() {}
