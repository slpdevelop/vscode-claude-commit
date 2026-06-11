# Руководство по тестированию

## Запуск в режиме разработки

### 1. Откройте проект в VSCode

```bash
code E:/work/vscode-workspaces/vscode-claude-commit
```

### 2. Запустите Extension Development Host

Есть два способа:

**Способ 1: Через клавишу F5**
- Просто нажмите `F5` в VSCode
- Откроется новое окно с заголовком "[Extension Development Host]"

**Способ 2: Через меню**
- Run → Start Debugging
- Или `Ctrl+F5` для запуска без отладки

### 3. Проверьте, что расширение загружено

В новом окне:
1. Откройте Command Palette (`Ctrl+Shift+P`)
2. Введите "Generate Commit Message"
3. Вы должны увидеть команду "Generate Commit Message with Claude"

## Настройка для тестирования

### 1. Создайте тестовый Git репозиторий

```bash
# В Extension Development Host откройте терминал
mkdir test-repo
cd test-repo
git init
```

### 2. Настройте API ключ

1. Откройте настройки (`Ctrl+,`)
2. Найдите "Claude Commit"
3. Вставьте ваш Anthropic API ключ

## Тестовые сценарии

### Тест 1: Базовая генерация commit message

```bash
# Создайте файл с изменениями
echo "console.log('Hello World');" > index.js
git add index.js
```

1. Откройте Source Control (`Ctrl+Shift+G`)
2. Нажмите на иконку ✨ (sparkle)
3. Дождитесь генерации
4. Проверьте сообщение

**Ожидаемый результат:**
- Появится уведомление "Generating commit message..."
- Затем "Commit message generated!"
- Сообщение появится в input box Source Control

### Тест 2: Conventional Commits

**Настройки:**
- `claudeCommit.useConventionalCommits`: `true` (по умолчанию)

```bash
# Создайте новую функцию
cat > auth.js << 'EOF'
function login(username, password) {
    return authenticateUser(username, password);
}
EOF
git add auth.js
```

Сгенерируйте commit message.

**Ожидаемый результат:**
Сообщение должно начинаться с типа: `feat(auth):` или `feat:`

### Тест 3: Редактирование сообщения

1. Сгенерируйте commit message
2. В диалоге выберите "Edit & Use"
3. Отредактируйте сообщение
4. Нажмите Enter

**Ожидаемый результат:**
- Откроется input box с сгенерированным сообщением
- После редактирования сообщение должно появиться в Source Control

### Тест 4: Анализ всех изменений

**Настройки:**
- `claudeCommit.analyzeAllChanges`: `true`

```bash
# Создайте файлы БЕЗ git add
echo "const x = 1;" > file1.js
echo "const y = 2;" > file2.js
# НЕ добавляйте в staging
```

Сгенерируйте commit message.

**Ожидаемый результат:**
Сообщение должно включать информацию об обоих файлах, даже если они не staged.

### Тест 5: Анализ только staged changes

**Настройки:**
- `claudeCommit.analyzeAllChanges`: `false`

```bash
echo "const a = 1;" > staged.js
echo "const b = 2;" > unstaged.js
git add staged.js
```

Сгенерируйте commit message.

**Ожидаемый результат:**
Сообщение должно упоминать только `staged.js`.

### Тест 6: Большой diff

```bash
# Создайте файл с большим количеством строк
for i in {1..2000}; do echo "const var$i = $i;" >> large.js; done
git add large.js
```

Сгенерируйте commit message.

**Ожидаемый результат:**
- Diff будет обрезан до maxDiffSize (50000 символов)
- Генерация всё равно должна работать

### Тест 7: Нет изменений

```bash
# Убедитесь, что нет изменений
git status # должен показать "nothing to commit"
```

Попробуйте сгенерировать commit message.

**Ожидаемый результат:**
Предупреждение "No changes detected"

### Тест 8: Разные модели

Протестируйте каждую модель:

1. **Haiku 4.5** (по умолчанию)
   - Должна работать быстро (~1-2 секунды)
   
2. **Sonnet 4.6**
   - Измените настройку `claudeCommit.model`
   - Может быть чуть медленнее, но сообщения более детальные

3. **Opus 4.8**
   - Самая медленная (~3-5 секунд)
   - Наиболее подробные сообщения

### Тест 9: Ошибка API ключа

1. Удалите API ключ из настроек
2. Попробуйте сгенерировать commit message

**Ожидаемый результат:**
- Появится ошибка "API key is not configured"
- Кнопка "Open Settings" для быстрого перехода

### Тест 10: Интеграция с Git

```bash
echo "function test() { return true; }" > test.js
git add test.js
```

1. Сгенерируйте commit message
2. Выберите "Use Message"
3. Проверьте, что сообщение появилось в input box
4. Сделайте commit через UI или `git commit`

**Ожидаемый результат:**
Commit должен быть создан с сгенерированным сообщением.

## Отладка

### Просмотр логов расширения

1. В Extension Development Host откройте Output panel
2. Выберите "Extension Host" в dropdown
3. Вы увидите логи расширения, включая:
   - "Claude Commit extension is now active"
   - Ошибки API
   - Другую debug информацию

### Breakpoints

1. Установите breakpoint в [src/extension.ts](src/extension.ts) или [src/commitGenerator.ts](src/commitGenerator.ts)
2. Запустите с F5 (не Ctrl+F5)
3. Выполните действие в Extension Development Host
4. Debugger остановится на breakpoint

### Проверка API запросов

Временно добавьте логирование в [src/commitGenerator.ts:60](src/commitGenerator.ts#L60):

```typescript
console.log('Sending to Claude:', { model, diffLength: diff.length });
console.log('Response:', message);
```

## Производительность

### Типичные времена ответа

- **Haiku 4.5**: 1-3 секунды
- **Sonnet 4.6**: 2-5 секунд  
- **Opus 4.8**: 3-8 секунд

### Размер diff

- Малый diff (<1KB): очень быстро
- Средний diff (1-10KB): нормально
- Большой diff (>10KB): может быть медленнее

### Стоимость

Приблизительная стоимость за один commit message:

- **Haiku**: $0.0005 - $0.002
- **Sonnet**: $0.005 - $0.02
- **Opus**: $0.02 - $0.1

## Проблемы и решения

### "Extension host terminated unexpectedly"

Перезапустите Extension Development Host (Ctrl+R в окне разработки).

### "Cannot find module"

```bash
npm install
npm run compile
```

### API ошибки

- Проверьте API ключ
- Проверьте интернет соединение
- Проверьте квоту на console.anthropic.com

### Медленная генерация

- Используйте Haiku вместо Opus
- Уменьшите `maxDiffSize`
- Проверьте размер diff

## Упаковка для продакшена

```bash
# Убедитесь, что всё скомпилировано
npm run compile

# Создайте .vsix
npm run package

# Файл появится: claude-commit-0.1.0.vsix
```

## Установка локально

```bash
# Через командную строку
code --install-extension claude-commit-0.1.0.vsix

# Или через UI
# Extensions → ... → Install from VSIX
```
