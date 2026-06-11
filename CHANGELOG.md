# Changelog

All notable changes to the "Claude Commit" extension will be documented in this file.

## [0.1.0] - 2026-06-11

### Added
- Initial release
- Generate commit messages using Claude AI
- Support for Claude Haiku 4.5, Sonnet 4.6, and Opus 4.8
- Conventional Commits format support
- Option to analyze all changes or only staged changes
- Edit generated message before committing
- Sparkle icon in Source Control toolbar
- Configuration options for model, format, and API key
- Diff size limiting to prevent large API requests

### Features
- 🤖 AI-powered commit message generation
- ⚡ Fast responses with Claude Haiku
- 📝 Conventional Commits support (feat:, fix:, etc.)
- ✏️ Edit messages before use
- 🎯 Analyze staged or all changes
- 💰 Cost-effective with model selection

### Configuration
- `claudeCommit.apiKey` - Anthropic API key
- `claudeCommit.model` - Claude model selection
- `claudeCommit.useConventionalCommits` - Enable/disable Conventional Commits
- `claudeCommit.analyzeAllChanges` - Analyze all vs staged changes
- `claudeCommit.maxDiffSize` - Limit diff size sent to API
