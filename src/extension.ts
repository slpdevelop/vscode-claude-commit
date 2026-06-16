import * as vscode from 'vscode';
import { ClaudeCommitGenerator } from './commitGenerator';

let commitGenerator: ClaudeCommitGenerator;

export function activate(context: vscode.ExtensionContext) {
    console.log('Claude Commit extension is now active');

    commitGenerator = new ClaudeCommitGenerator();

    const disposable = vscode.commands.registerCommand(
        'claude-commit.generate',
        async (arg?: any) => {
            try {
                await generateCommitMessage(arg);
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to generate commit message: ${error instanceof Error ? error.message : 'Unknown error'}`
                );
            }
        }
    );

    context.subscriptions.push(disposable);
}

async function generateCommitMessage(scmArg?: any) {
    const config = vscode.workspace.getConfiguration('claudeCommit');
    const provider = config.get<string>('provider') || 'anthropic';
    const apiKey = config.get<string>('apiKey');

    if (provider === 'anthropic' && !apiKey) {
        const action = await vscode.window.showErrorMessage(
            'Anthropic API key is not configured. Please set your API key in settings or switch to Bedrock provider.',
            'Open Settings',
            'Use Bedrock'
        );

        if (action === 'Open Settings') {
            vscode.commands.executeCommand('workbench.action.openSettings', 'claudeCommit');
        } else if (action === 'Use Bedrock') {
            await config.update('provider', 'bedrock', vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('Switched to AWS Bedrock. Make sure your AWS credentials are configured.');
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

    const repository = await resolveRepository(git, scmArg);
    if (!repository) {
        return;
    }

    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: 'Generating commit message with Claude...',
            cancellable: false
        },
        async () => {
            const message = await commitGenerator.generateCommitMessage(repository);

            if (message) {
                repository.inputBox.value = message;
            }
        }
    );
}

function hasChanges(repository: any): boolean {
    const state = repository.state;
    if (!state) {
        return false;
    }
    const working = state.workingTreeChanges?.length ?? 0;
    const indexed = state.indexChanges?.length ?? 0;
    const merge = state.mergeChanges?.length ?? 0;
    const untracked = state.untrackedChanges?.length ?? 0;
    return working + indexed + merge + untracked > 0;
}

function repositoryLabel(repository: any): string {
    const rootUri = repository.rootUri;
    if (rootUri) {
        const folder = vscode.workspace.getWorkspaceFolder(rootUri);
        if (folder) {
            return folder.name;
        }
        const path = rootUri.fsPath as string;
        return path.split(/[\\/]/).filter(Boolean).pop() || path;
    }
    return 'repository';
}

async function resolveRepository(git: any, scmArg?: any): Promise<any | undefined> {
    const repositories: any[] = git.repositories;

    // Invoked from the SCM title icon — VS Code passes the SourceControl (or a
    // repository) of the panel that was clicked. Use exactly that repository.
    const scmRoot = scmArg?.rootUri?.fsPath as string | undefined;
    if (scmRoot) {
        const matched = repositories.find(
            repo => (repo.rootUri?.fsPath as string | undefined) === scmRoot
        );
        if (matched) {
            return matched;
        }
    }

    // Invoked from the command palette — always let the user choose.
    if (repositories.length === 1) {
        return repositories[0];
    }

    const picked = await vscode.window.showQuickPick(
        repositories.map(repo => ({
            label: repositoryLabel(repo),
            description: repo.rootUri?.fsPath,
            detail: hasChanges(repo) ? '$(diff) Has changes' : 'No changes',
            repository: repo
        })),
        {
            placeHolder: 'Select a repository to generate a commit message for',
            ignoreFocusOut: true
        }
    );

    return picked?.repository;
}

export function deactivate() {}
