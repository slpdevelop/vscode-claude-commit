# Структура проекта

```
vscode-claude-commit/
├── .vscode/                    # VSCode конфигурация
│   ├── launch.json            # Настройки запуска для отладки
│   └── tasks.json             # Задачи сборки
├── node_modules/              # Зависимости (создаётся при npm install)
├── out/                       # Скомпилированный JavaScript (создаётся при npm run compile)
│   ├── extension.js
│   ├── extension.js.map
│   ├── commitGenerator.js
│   └── commitGenerator.js.map
├── src/                       # Исходный код TypeScript
│   ├── extension.ts          # Главный файл расширения
│   └── commitGenerator.ts    # Логика генерации commit messages
├── .eslintrc.json            # Конфигурация ESLint
├── .gitignore                # Git ignore файл
├── .vscodeignore             # Файлы, исключаемые из .vsix пакета
├── CHANGELOG.md              # История изменений
├── LICENSE                   # MIT лицензия
├── package.json              # Манифест расширения и зависимости
├── package-lock.json         # Locked версии зависимостей
├── PROJECT_STRUCTURE.md      # Этот файл
├── QUICK_START.md            # Быстрый старт
├── README.md                 # Основная документация
├── TESTING.md                # Руководство по тестированию
└── tsconfig.json             # Конфигурация TypeScript
```

## Основные файлы

### package.json
Манифест расширения VSCode. Содержит:
- Метаданные расширения (имя, версия, описание)
- Точку входа (`main`: `./out/extension.js`)
- Команды (`contributes.commands`)
- Настройки (`contributes.configuration`)
- Меню (`contributes.menus`)
- Зависимости

### src/extension.ts
Главный файл расширения. Содержит:
- `activate()` - вызывается при активации расширения
- `deactivate()` - вызывается при деактивации
- Регистрацию команды `claude-commit.generate`
- Логику UI взаимодействия

### src/commitGenerator.ts
Класс для работы с Claude API. Содержит:
- `ClaudeCommitGenerator` класс
- `generateCommitMessage()` - основной метод генерации
- `buildPrompt()` - построение промпта для Claude
- Работу с Anthropic SDK

### tsconfig.json
Конфигурация TypeScript компилятора:
- Компиляция в CommonJS
- Target: ES2020
- Strict mode включён
- Source maps для отладки

### .vscode/launch.json
Конфигурация для запуска расширения в режиме разработки:
- Запускает Extension Development Host
- Компилирует TypeScript перед запуском
- Включает source maps для отладки

## Команды и меню

### Команды (package.json)

```json
{
  "command": "claude-commit.generate",
  "title": "Generate Commit Message with Claude",
  "icon": "$(sparkle)"
}
```

Доступна через:
- Command Palette: `Ctrl+Shift+P` → "Generate Commit Message with Claude"
- Source Control toolbar: иконка ✨

### Меню (package.json)

```json
{
  "scm/title": [
    {
      "command": "claude-commit.generate",
      "group": "navigation",
      "when": "scmProvider == git"
    }
  ]
}
```

Иконка появляется в Source Control panel только для Git репозиториев.

## Настройки (package.json)

| Настройка | Тип | По умолчанию | Описание |
|-----------|-----|--------------|----------|
| `claudeCommit.apiKey` | string | `""` | Anthropic API ключ |
| `claudeCommit.model` | enum | `"claude-haiku-4-5-20251001"` | Модель Claude |
| `claudeCommit.useConventionalCommits` | boolean | `true` | Использовать Conventional Commits |
| `claudeCommit.analyzeAllChanges` | boolean | `true` | Анализировать все изменения |
| `claudeCommit.maxDiffSize` | number | `50000` | Максимальный размер diff |

## Зависимости

### Продакшен
- `@anthropic-ai/sdk`: ^0.30.0 - официальный SDK для Claude API

### Разработка
- `@types/node`: ^20.0.0 - типы Node.js
- `@types/vscode`: ^1.80.0 - типы VSCode API
- `@typescript-eslint/eslint-plugin`: ^6.0.0 - ESLint для TypeScript
- `@typescript-eslint/parser`: ^6.0.0 - парсер TypeScript для ESLint
- `eslint`: ^8.45.0 - линтер
- `typescript`: ^5.1.6 - компилятор TypeScript
- `@vscode/vsce`: ^2.19.0 - инструмент для упаковки расширений

## API VSCode

### Используемые API

**Commands API**
- `vscode.commands.registerCommand()` - регистрация команды

**Window API**
- `vscode.window.showErrorMessage()` - показать ошибку
- `vscode.window.showInformationMessage()` - показать информацию
- `vscode.window.showWarningMessage()` - показать предупреждение
- `vscode.window.showInputBox()` - показать input box
- `vscode.window.withProgress()` - показать progress indicator

**Workspace API**
- `vscode.workspace.getConfiguration()` - получить настройки

**Extensions API**
- `vscode.extensions.getExtension()` - получить расширение Git

**Git API** (через vscode.git расширение)
- `git.repositories` - список репозиториев
- `repository.diff()` - получить diff
- `repository.inputBox` - input box для commit message

## Workflow разработки

### 1. Редактирование кода
Измените файлы в `src/`

### 2. Компиляция
```bash
npm run compile     # Однократная компиляция
# или
npm run watch       # Автоматическая перекомпиляция при изменениях
```

### 3. Тестирование
- Нажмите F5 для запуска Extension Development Host
- Тестируйте в новом окне
- Для перезагрузки изменений: Ctrl+R в Extension Development Host

### 4. Отладка
- Установите breakpoints в .ts файлах
- Запустите с F5
- Debugger остановится на breakpoints

### 5. Упаковка
```bash
npm run package     # Создаёт .vsix файл
```

## Архитектура

```
User clicks sparkle icon
         ↓
extension.ts:generateCommitMessage()
         ↓
Get Git repository from VSCode Git API
         ↓
commitGenerator.generateCommitMessage()
         ↓
Get diff from repository
         ↓
Build prompt with settings
         ↓
Call Claude API via Anthropic SDK
         ↓
Return commit message
         ↓
Show dialog to user
         ↓
User chooses: Use / Edit & Use / Cancel
         ↓
Set repository.inputBox.value
```

## Безопасность

- API ключ хранится в VSCode settings (не в коде)
- API ключ не логируется
- Diff может содержать чувствительные данные - отправляется только в Claude API
- Нет внешних зависимостей кроме официального Anthropic SDK

## Расширяемость

### Добавление новых моделей

1. Обновите `package.json` → `contributes.configuration` → `claudeCommit.model.enum`
2. Добавьте описание в `enumDescriptions`

### Добавление новых форматов

1. Создайте новую настройку в `package.json`
2. Обновите `buildPrompt()` в `commitGenerator.ts`

### Добавление новых команд

1. Зарегистрируйте команду в `package.json` → `contributes.commands`
2. Зарегистрируйте обработчик в `extension.ts` → `activate()`

## Ресурсы

- [VSCode Extension API](https://code.visualstudio.com/api)
- [Anthropic Claude API](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [Git Extension API](https://github.com/microsoft/vscode/blob/main/extensions/git/src/api/git.d.ts)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
