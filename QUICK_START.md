# Быстрый старт

## Установка

### 1. Установите зависимости

```bash
cd E:/work/vscode-workspaces/vscode-claude-commit
npm install
```

### 2. Скомпилируйте проект

```bash
npm run compile
```

### 3. Запустите в режиме разработки

Откройте проект в VSCode и нажмите `F5`. Откроется новое окно VSCode с установленным расширением.

## Настройка

### 1. Получите API ключ

1. Перейдите на https://console.anthropic.com/
2. Создайте или войдите в аккаунт
3. Перейдите в раздел API Keys
4. Создайте новый ключ

### 2. Настройте расширение

1. В VSCode откройте настройки (`Ctrl+,`)
2. Найдите "Claude Commit"
3. Вставьте ваш API ключ в поле "Api Key"

## Использование

### Способ 1: Через Source Control

1. Внесите изменения в код
2. Откройте панель Source Control (`Ctrl+Shift+G`)
3. Нажмите на иконку ✨ (sparkle) в тулбаре
4. Подождите генерации сообщения
5. Выберите "Use Message" или "Edit & Use"

### Способ 2: Через Command Palette

1. Откройте Command Palette (`Ctrl+Shift+P`)
2. Введите "Generate Commit Message with Claude"
3. Нажмите Enter

## Упаковка расширения

Чтобы создать `.vsix` файл для установки:

```bash
npm run package
```

Это создаст файл `claude-commit-0.1.0.vsix`.

### Установка из VSIX

1. В VSCode: Extensions → ... (три точки) → Install from VSIX
2. Выберите созданный `.vsix` файл
3. Перезапустите VSCode

## Настройки

Все настройки доступны в VSCode Settings → Extensions → Claude Commit:

- **Api Key**: Ваш Anthropic API ключ (обязательно)
- **Model**: Модель Claude (по умолчанию Haiku 4.5)
- **Use Conventional Commits**: Использовать формат Conventional Commits (по умолчанию true)
- **Analyze All Changes**: Анализировать все изменения, а не только staged (по умолчанию true)
- **Max Diff Size**: Максимальный размер diff в символах (по умолчанию 50000)

## Примеры commit messages

### С Conventional Commits:
```
feat(auth): add password reset functionality

Implement email-based password reset with token expiration.
Includes rate limiting and security checks.
```

### Без Conventional Commits:
```
Add password reset functionality

Implement email-based password reset with token expiration.
Includes rate limiting and security checks.
```

## Troubleshooting

### "No changes detected"
- Убедитесь, что у вас есть незакоммиченные изменения
- Проверьте, что вы находитесь в git репозитории

### "API key not configured"
- Откройте настройки VSCode
- Найдите "Claude Commit: Api Key"
- Вставьте ваш Anthropic API ключ

### Ошибки компиляции
```bash
# Удалите node_modules и переустановите
rm -rf node_modules
npm install
npm run compile
```

## Стоимость использования

- **Haiku 4.5**: ~$0.001 за commit message (рекомендуется)
- **Sonnet 4.6**: ~$0.01 за commit message
- **Opus 4.8**: ~$0.05 за commit message

Для большинства случаев Haiku более чем достаточно.
