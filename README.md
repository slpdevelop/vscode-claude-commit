# Claude Commit Message Generator

A VS Code extension that writes your git commit messages with Claude. Click one button in the Source Control panel and the generated message is dropped straight into the commit box.

It supports three ways to talk to Claude:

- **Claude Code CLI** — uses your existing Claude login / subscription. **No API key, no credits.**
- **Anthropic API** — direct API access with an API key.
- **AWS Bedrock** — Claude via your AWS account.

![Claude](media/claude.png)

## Features

- One-click commit message generation from the Source Control title bar.
- Works across **multiple repositories**: clicking the icon generates for that repo; from the Command Palette you get a picker.
- Generated message is inserted **directly** into the commit input box — no extra dialogs.
- **Conventional Commits** format (toggle-able).
- **Custom style instructions** — write your own rules (language, tone, scope, length…).
- Analyze all changes or staged-only.
- Diff size cap to keep requests bounded.

## Installation

This extension is distributed as a `.vsix` (build it yourself — see [Development](#development)):

```bash
code --install-extension claude-commit-<version>.vsix --force
```

Then **Reload Window** (`Ctrl+Shift+P` → *Developer: Reload Window*).

## Usage

1. Make some changes in a git repository.
2. Generate a message in either way:
   - **Source Control panel** → click the Claude icon in the title bar of the repo you want.
   - **Command Palette** (`Ctrl+Shift+P`) → *Generate Commit Message with Claude*. If more than one repository is open, you'll be asked which one.
3. The message appears in the commit input box, ready to edit or commit.

If no changes are detected, the extension tells you instead of producing an empty message. Working tree, staged, merge, and untracked changes are all taken into account when picking the repository.

## Configuration

Open **Settings** → search for **Claude Commit**.

| Setting | Default | Description |
| --- | --- | --- |
| `claudeCommit.provider` | `anthropic` | `anthropic`, `bedrock`, or `claude-cli`. |
| `claudeCommit.model` | `claude-haiku-4-5-20251001` | Model to use (`claude-haiku-4-5-20251001`, `claude-sonnet-4-6`, `claude-opus-4-8`). |
| `claudeCommit.customInstructions` | _(empty)_ | Extra style instructions appended to the prompt. Take precedence over the defaults. |
| `claudeCommit.useConventionalCommits` | `true` | Use Conventional Commits format (`feat:`, `fix:`, …). |
| `claudeCommit.analyzeAllChanges` | `true` | Analyze all changes (`true`) or staged-only (`false`). |
| `claudeCommit.maxDiffSize` | `50000` | Maximum diff size (characters) sent to Claude; larger diffs are truncated. |
| `claudeCommit.apiKey` | _(empty)_ | Anthropic API key. **Provider: `anthropic`.** |
| `claudeCommit.awsRegion` | `us-east-1` | AWS region for Bedrock. **Provider: `bedrock`.** |
| `claudeCommit.awsProfile` | _(empty)_ | AWS CLI profile (optional). **Provider: `bedrock`.** |
| `claudeCommit.claudeCliPath` | `claude` | Path/command for the Claude Code CLI. **Provider: `claude-cli`.** |
| `claudeCommit.claudeCliUseModel` | `false` | Pass `claudeCommit.model` to the CLI as `--model`. When off, the CLI uses your Claude Code default model. **Provider: `claude-cli`.** |

## Providers

### Claude Code CLI (recommended if you have a Claude subscription)

Uses the [Claude Code](https://claude.com/claude-code) CLI you already have logged in — your subscription auth is reused, nothing is stored by the extension.

1. Install Claude Code and log in once (`claude` in a terminal).
2. Set `claudeCommit.provider` = `claude-cli`.
3. If `claude` isn't on PATH, set `claudeCommit.claudeCliPath` to its full path.

The extension runs `claude -p` in non-interactive mode and **strips `ANTHROPIC_API_KEY` / `ANTHROPIC_AUTH_TOKEN` from the child process** so the CLI uses your subscription instead of accidentally billing the API. The CLI executable is also resolved from common install locations (e.g. `~/.local/bin/claude`) so it works even if the VS Code process has a stale PATH.

### Anthropic API

1. Get an API key at <https://console.anthropic.com/>.
2. Set `claudeCommit.provider` = `anthropic` and paste the key into `claudeCommit.apiKey`.

### AWS Bedrock

1. Configure AWS credentials (default chain, or a named profile).
2. Set `claudeCommit.provider` = `bedrock`, plus `claudeCommit.awsRegion` and optionally `claudeCommit.awsProfile`.

> Note: Bedrock maps the configured model name to the corresponding Bedrock Claude model ID internally.

## Custom style instructions

`claudeCommit.customInstructions` is a free-text, multi-line field added to the prompt. It overrides the default requirements. Examples:

- `Write commit messages in Russian.`
- `Always include a scope, e.g. feat(api): ...`
- `Keep the subject under 50 characters and add a short body explaining why.`

## Development

```bash
npm install        # install dependencies
npm run compile    # type-check + build to out/
npm run watch      # rebuild on change
npm run lint       # eslint
npm run package    # produce claude-commit-<version>.vsix
```

Run the extension from source with **F5** (Extension Development Host).

Source layout:

- `src/extension.ts` — command registration, repository selection, inserting the message.
- `src/commitGenerator.ts` — prompt building and the three provider backends.
- `media/` — extension and Source Control icons.

## Troubleshooting

**`command 'claude-commit.generate' not found` after installing the .vsix**
The package must include `node_modules` (the SDK dependencies). This is already handled by `.vscodeignore`; if you re-add `node_modules/**` there, activation will fail. Reinstall the freshly built `.vsix` and reload the window.

**`Credit balance is too low` with provider `claude-cli`**
An `ANTHROPIC_API_KEY` in your environment was making the CLI bill the API. The extension strips it automatically — make sure you're on the latest build, then reload.

**`Could not launch Claude CLI`**
The `claude` executable wasn't found. Set `claudeCommit.claudeCliPath` to its full path (e.g. `C:\Users\<you>\.local\bin\claude.exe`), and confirm `claude --version` works in a terminal.

**`No changes detected`**
There are no working-tree, staged, merge, or untracked changes in the selected repository.

## License

MIT — see [LICENSE](LICENSE).
