import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { fromIni } from '@aws-sdk/credential-providers';

type Provider = 'anthropic' | 'bedrock' | 'claude-cli';

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
        const customInstructions = config.get<string>('customInstructions') || '';
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

        const prompt = this.buildPrompt(diff, useConventionalCommits, customInstructions);

        try {
            if (provider === 'bedrock') {
                return await this.generateWithBedrock(model, prompt);
            } else if (provider === 'claude-cli') {
                return await this.generateWithClaudeCli(model, prompt);
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

    // Resolve the Claude CLI executable. The extension host's PATH can be stale
    // (e.g. missing ~/.local/bin if VS Code was started before Claude Code was
    // installed), so prefer a known absolute path and only fall back to PATH.
    private resolveClaudeCli(configuredPath: string): { command: string; useShell: boolean } {
        if (configuredPath && configuredPath !== 'claude') {
            return { command: configuredPath, useShell: false };
        }

        const home = os.homedir();
        const candidates: string[] =
            process.platform === 'win32'
                ? [
                      path.join(home, '.local', 'bin', 'claude.exe'),
                      path.join(home, 'AppData', 'Local', 'Programs', 'claude', 'claude.exe')
                  ]
                : [
                      path.join(home, '.local', 'bin', 'claude'),
                      '/usr/local/bin/claude',
                      '/opt/homebrew/bin/claude'
                  ];

        for (const candidate of candidates) {
            try {
                if (fs.existsSync(candidate)) {
                    return { command: candidate, useShell: false };
                }
            } catch {
                // ignore and keep looking
            }
        }

        // Last resort: rely on PATH (needs the shell on Windows to resolve .exe/.cmd).
        return { command: 'claude', useShell: process.platform === 'win32' };
    }

    private generateWithClaudeCli(model: string, prompt: string): Promise<string | null> {
        return new Promise((resolve, reject) => {
            const config = vscode.workspace.getConfiguration('claudeCommit');
            const configuredPath = config.get<string>('claudeCliPath') || 'claude';
            const passModel = config.get<boolean>('claudeCliUseModel', false);
            const { command, useShell } = this.resolveClaudeCli(configuredPath);

            // -p runs Claude Code in non-interactive print mode and emits the
            // response to stdout. Auth (API key or subscription login) is whatever
            // the installed CLI already uses, so no credentials are handled here.
            const args = ['-p'];
            if (passModel && model) {
                args.push('--model', model);
            }

            // The user picked the CLI provider to use their Claude login/subscription.
            // A stale ANTHROPIC_API_KEY (commonly inherited by the VS Code GUI process)
            // would make the CLI bill the API instead and fail with
            // "Credit balance is too low" in non-interactive mode, so strip it here.
            const env = { ...process.env };
            delete env.ANTHROPIC_API_KEY;
            delete env.ANTHROPIC_AUTH_TOKEN;

            const child = cp.spawn(command, args, {
                shell: useShell,
                windowsHide: true,
                env
            });

            let stdout = '';
            let stderr = '';

            child.on('error', (err) => {
                reject(new Error(
                    `Could not launch Claude CLI ('${command}'). Make sure Claude Code is installed, ` +
                    `or set "claudeCommit.claudeCliPath" to its full path. Details: ${err.message}`
                ));
            });

            child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
            child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

            child.on('close', (code) => {
                if (code !== 0) {
                    // Claude Code often prints failures to stdout in print mode, so
                    // surface both streams; hint at the most common cause (auth).
                    const detail =
                        stderr.trim() ||
                        stdout.trim() ||
                        'no output — the CLI may not be logged in. Run `claude` once in a terminal to authenticate.';
                    reject(new Error(`Claude CLI exited with code ${code}: ${detail}`));
                    return;
                }
                const text = stdout.trim();
                resolve(text.length > 0 ? text : null);
            });

            // Pass the prompt via stdin to avoid command-line length/quoting limits on large diffs.
            child.stdin.write(prompt);
            child.stdin.end();
        });
    }

    private buildPrompt(diff: string, useConventionalCommits: boolean, customInstructions: string): string {
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

        const customInstructionsGuide = customInstructions.trim()
            ? `
Additional style instructions (these take precedence over the defaults above):
${customInstructions.trim()}
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
${customInstructionsGuide}
Git diff:
\`\`\`
${diff}
\`\`\`

Generate only the commit message, nothing else. No explanations, no markdown, just the commit message text.`;
    }
}
