import * as vscode from 'vscode';
import Anthropic from '@anthropic-ai/sdk';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { fromIni } from '@aws-sdk/credential-providers';

type Provider = 'anthropic' | 'bedrock';

export class ClaudeCommitGenerator {
    private anthropic: Anthropic | null = null;
    private bedrock: BedrockRuntimeClient | null = null;

    private getAnthropicClient(): Anthropic {
        const config = vscode.workspace.getConfiguration('claudeCommit');
        const apiKey = config.get<string>('apiKey');

        if (!apiKey) {
            throw new Error('API key not configured. Please set claudeCommit.apiKey in settings.');
        }

        if (!this.anthropic) {
            this.anthropic = new Anthropic({ apiKey });
        }

        return this.anthropic;
    }

    private getBedrockClient(): BedrockRuntimeClient {
        const config = vscode.workspace.getConfiguration('claudeCommit');
        const region = config.get<string>('awsRegion') || 'us-east-1';
        const profile = config.get<string>('awsProfile');

        if (!this.bedrock) {
            const clientConfig: any = { region };

            if (profile) {
                clientConfig.credentials = fromIni({ profile });
            }

            this.bedrock = new BedrockRuntimeClient(clientConfig);
        }

        return this.bedrock;
    }

    private getBedrockModelId(model: string): string {
        // Map VSCode setting names to Bedrock model IDs
        // Note: Bedrock uses different naming - Claude 3.5 Haiku, Claude 3.5 Sonnet, etc.
        const modelMap: Record<string, string> = {
            'claude-haiku-4-5-20251001': 'anthropic.claude-3-5-haiku-20241022-v1:0',
            'claude-sonnet-4-6': 'anthropic.claude-3-5-sonnet-20241022-v2:0',
            'claude-opus-4-8': 'anthropic.claude-3-opus-20240229-v1:0'
        };

        return modelMap[model] || modelMap['claude-haiku-4-5-20251001'];
    }

    async generateCommitMessage(repository: any): Promise<string | null> {
        const config = vscode.workspace.getConfiguration('claudeCommit');
        const provider = config.get<string>('provider') as Provider || 'anthropic';
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
            if (provider === 'bedrock') {
                return await this.generateWithBedrock(model, prompt);
            } else {
                return await this.generateWithAnthropic(model, prompt);
            }
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Claude API error: ${error.message}`);
            }
            throw error;
        }
    }

    private async generateWithAnthropic(model: string, prompt: string): Promise<string | null> {
        const client = this.getAnthropicClient();
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
    }

    private async generateWithBedrock(model: string, prompt: string): Promise<string | null> {
        const client = this.getBedrockClient();
        const bedrockModelId = this.getBedrockModelId(model);

        const payload = {
            anthropic_version: 'bedrock-2023-05-31',
            max_tokens: 500,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        };

        const command = new InvokeModelCommand({
            modelId: bedrockModelId,
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify(payload)
        });

        const response = await client.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));

        if (responseBody.content && responseBody.content[0] && responseBody.content[0].text) {
            return responseBody.content[0].text.trim();
        }

        return null;
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
