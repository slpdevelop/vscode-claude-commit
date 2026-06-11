# 🚀 Начните здесь!

## Быстрый старт за 3 шага

### 1️⃣ Откройте проект в VSCode

```bash
code E:/work/vscode-workspaces/vscode-claude-commit
```

### 2️⃣ Нажмите F5

Это запустит расширение в режиме разработки. Откроется новое окно VSCode с заголовком **[Extension Development Host]**.

### 3️⃣ Настройте доступ к Claude

**У вас есть два варианта:**

#### Вариант А: Anthropic API

1. Получите API ключ → https://console.anthropic.com/
2. В Extension Development Host: `Ctrl+,` → "Claude Commit"
3. Set **Provider** = `anthropic`
4. Вставьте API ключ

#### Вариант Б: AWS Bedrock (БЕЗ API ключа!)

1. Настройте AWS: `aws configure`
2. В Extension Development Host: `Ctrl+,` → "Claude Commit"
3. Set **Provider** = `bedrock`
4. Set **Aws Region** = `us-east-1`

**Детали:** См. [BEDROCK_SETUP.md](BEDROCK_SETUP.md)

---

## ✨ Первое использование

### Тестовый репозиторий

В окне **Extension Development Host**:

```bash
# Создайте тестовый репозиторий
mkdir ~/test-repo
cd ~/test-repo
git init

# Создайте файл
echo "console.log('Hello');" > index.js
git add index.js
```

### Сгенерируйте commit message

1. Откройте Source Control: `Ctrl+Shift+G`
2. Нажмите на иконку **✨** (sparkle) в тулбаре
3. Подождите 2-3 секунды
4. Выберите "Use Message" или "Edit & Use"

**Готово!** 🎉 Commit message сгенерирован.

---

## 📖 Что дальше?

- **[README.md](README.md)** - полная документация
- **[QUICK_START.md](QUICK_START.md)** - детальное руководство
- **[TESTING.md](TESTING.md)** - как тестировать все функции
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - структура проекта

---

## 🔧 Полезные команды

```bash
# Компиляция
npm run compile

# Автоматическая перекомпиляция
npm run watch

# Упаковка в .vsix
npm run package

# Линтинг
npm run lint
```

---

## ⚠️ Проблемы?

### "Extension host terminated"
Нажмите `Ctrl+R` в окне Extension Development Host.

### "API key not configured"
Проверьте настройки: Settings → Claude Commit → Api Key

### Не компилируется
```bash
rm -rf node_modules
npm install
npm run compile
```

---

## 💰 Стоимость

- **Haiku 4.5**: ~$0.001 за commit (рекомендуется)
- **Sonnet 4.6**: ~$0.01 за commit
- **Opus 4.8**: ~$0.05 за commit

---

## 🎯 Основные файлы для редактирования

- **[src/extension.ts](src/extension.ts)** - UI логика, команды
- **[src/commitGenerator.ts](src/commitGenerator.ts)** - работа с Claude API
- **[package.json](package.json)** - настройки расширения

---

## 📝 Отладка

1. Установите breakpoint в `.ts` файле
2. Нажмите `F5`
3. Используйте расширение в Extension Development Host
4. Debugger остановится на breakpoint

Логи: Output panel → "Extension Host"

---

## 🚢 Публикация

```bash
# 1. Создайте .vsix
npm run package

# 2. Установите локально
code --install-extension claude-commit-0.1.0.vsix

# 3. Или опубликуйте в Marketplace
# https://code.visualstudio.com/api/working-with-extensions/publishing-extension
```

---

**Удачи! 🎉**

Если что-то не работает, проверьте [TESTING.md](TESTING.md) → раздел "Проблемы и решения".
