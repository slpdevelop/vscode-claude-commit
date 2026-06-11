# Claude Commit Message Generator

Generate high-quality git commit messages using Claude AI directly from VSCode.

## Features

- 🤖 **AI-Powered**: Uses Claude to analyze your changes and generate meaningful commit messages
- ⚡ **Fast**: Uses Claude Haiku by default for quick responses
- 📝 **Conventional Commits**: Optional support for Conventional Commits format
- ✏️ **Editable**: Review and edit generated messages before committing
- 🎯 **Smart**: Analyzes both staged and unstaged changes

## Installation

### From Source

1. Clone this repository
2. Run `npm install`
3. Run `npm run compile`
4. Press F5 to open a new VSCode window with the extension loaded

### From VSIX

1. Run `npm run package` to create a `.vsix` file
2. In VSCode, go to Extensions → ... → Install from VSIX
3. Select the generated `.vsix` file

## Setup

### Option 1: Anthropic API (Direct)

1. Get your Anthropic API key from https://console.anthropic.com/
2. Open VSCode Settings (`Ctrl+,` or `Cmd+,`)
3. Search for "Claude Commit"
4. Set "Provider" to `anthropic`
5. Enter your API key in "Claude Commit: Api Key"

### Option 2: AWS Bedrock (Recommended for AWS users)

1. Configure AWS credentials (see [BEDROCK_SETUP.md](BEDROCK_SETUP.md))
2. Open VSCode Settings (`Ctrl+,` or `Cmd+,`)
3. Search for "Claude Commit"
4. Set "Provider" to `bedrock`
5. Set "Aws Region" (e.g., `us-east-1`)
6. Optionally set "Aws Profile" if using named profiles

**Detailed Bedrock setup:** See [BEDROCK_SETUP.md](BEDROCK_SETUP.md)

## Usage

### Generate Commit Message

1. Make changes to your code
2. Open Source Control view (`Ctrl+Shift+G`)
3. Click the sparkle icon (✨) in the Source Control toolbar
4. Or use Command Palette: `Generate Commit Message with Claude`

The extension will:
- Analyze your changes
- Generate a commit message
- Let you choose to use it as-is or edit it first

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `claudeCommit.provider` | `anthropic` | API provider: `anthropic` or `bedrock` |
| `claudeCommit.apiKey` | `""` | Your Anthropic API key (for `anthropic` provider) |
| `claudeCommit.awsRegion` | `us-east-1` | AWS region (for `bedrock` provider) |
| `claudeCommit.awsProfile` | `""` | AWS profile name (optional, for `bedrock`) |
| `claudeCommit.model` | `claude-haiku-4-5-20251001` | Claude model to use |
| `claudeCommit.useConventionalCommits` | `true` | Use Conventional Commits format |
| `claudeCommit.analyzeAllChanges` | `true` | Analyze all changes (not just staged) |
| `claudeCommit.maxDiffSize` | `50000` | Maximum diff size to send to Claude |

### Available Models

- **Claude Haiku 4.5** (Recommended): Fast and economical, perfect for commit messages
- **Claude Sonnet 4.6**: More advanced, for complex changes
- **Claude Opus 4.8**: Most powerful, but more expensive

## Examples

### With Conventional Commits (default)

```
feat(auth): add JWT token refresh mechanism

Implement automatic token refresh when tokens expire.
Includes retry logic and error handling.
```

### Without Conventional Commits

```
Add JWT token refresh mechanism

Implement automatic token refresh when tokens expire.
Includes retry logic and error handling.
```

## Tips

- **Large diffs**: If your diff is very large, consider staging specific files first
- **Context**: The more focused your changes, the better the commit message
- **Edit**: Always review and edit the generated message if needed
- **API costs**: Use Haiku for cost-effective generation (most commits don't need Opus)

## Development

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode
npm run watch

# Package extension
npm run package
```

## Requirements

- VSCode 1.80.0 or higher
- Git repository
- **Either:**
  - Anthropic API key (for direct API access), **OR**
  - AWS credentials with Bedrock access (for AWS Bedrock)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
