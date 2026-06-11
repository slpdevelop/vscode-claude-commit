import * as vscode from 'vscode';
import Anthropic from '@anthropic-ai/sdk';

export class ClaudeCommitGenerator {
    private anthropic: Anthropic | null = null;

    private getClient(): Anthropic {
        const config = vscode.workspace.getConfiguration('claudeCommit');
        const apiKey = config.get<string>('apiKey');

        if (!apiKey) {
            throw new Error('API key not configured');
        }

        if (!this.anthropic) {
            this.anthropic = new Anthropic({ apiKey });
        }

        return this.anthropic;
    }

    async generateCommitMessage(repository: any): Promise<string | null> {
        const config = vscode.workspace.getConfiguration('claudeCommit');
        const model = config.get<string>('model') || 'claude-haiku-4-5-20251001';
        const useConventionalCommits = config.get<boolean>('useConventionalCommits', true);
        const analyzeAllChanges = config.get<boolean>('analyzeAllChanges', true);
        const maxDiffSize = config.get<number>('maxDiffSize', 50000);

        let diff: string;

        if (analyzeAllChanges) {
            diff = await repository.diff(false);
        } else {
            diff = await repository.diff(true);
        }

        if (!diff || diff.trim().length === 0) {
            vscode.window.showWarningMessage('No changes detected');
            return null;
        }

        if (diff.length > maxDiffSize) {
            diff = diff.substring(0, maxDiffSize) + '\n\n... (diff truncated due to size)';
        }

        const prompt = this.buildPrompt(diff, useConventionalCommits);

        try {
            const client = this.getClient();
            const message = await client.messages.create({
                model: model,
                max_tokens: 500,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            });

            if (message.content[0].type === 'text') {
                return message.content[0].text.trim();
            }

            return null;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Claude API error: ${error.message}`);
            }
            throw error;
        }
    }

    private buildPrompt(diff: string, useConventionalCommits: boolean): string {
        const conventionalCommitsGuide = useConventionalCommits
            ? `
Use Conventional Commits format:
- feat: A new feature
- fix: A bug fix
- docs: Documentation only changes
- style: Changes that don't affect code meaning (formatting, etc)
- refactor: Code change that neither fixes a bug nor adds a feature
- perf: Performance improvement
- test: Adding or correcting tests
- chore: Changes to build process or auxiliary tools

Format: <type>(<scope>): <subject>

Example: "feat(auth): add user login functionality"
`
            : '';

        return `You are an expert at writing clear, concise git commit messages.

Analyze the following git diff and generate an appropriate commit message.

${conventionalCommitsGuide}

Requirements:
- Write a clear, descriptive commit message
- Keep the first line under 72 characters
- Focus on WHAT changed and WHY
- Don't include unnecessary details
- Be specific and actionable
${useConventionalCommits ? '- Use the appropriate conventional commit type' : ''}

Git diff:
\`\`\`
${diff}
\`\`\`

Generate only the commit message, nothing else. No explanations, no markdown, just the commit message text.`;
    }
}
