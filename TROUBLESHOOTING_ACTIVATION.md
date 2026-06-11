# Troubleshooting: Command Not Found

## Проблема
`command 'claude-commit.generate' not found`

## Решение

### ✅ ШАГ 1: Полностью переустановите расширение

#### 1.1 Удалите ВСЕ версии расширения

```bash
# Посмотрите установленные расширения
code --list-extensions | grep claude

# Удалите все версии
code --uninstall-extension your-publisher-name.claude-commit
```

#### 1.2 Очистите кэш VSCode (опционально, но рекомендуется)

**Windows:**
```bash
# Закройте VSCode полностью, затем:
rmdir /s /q "%APPDATA%\Code\CachedExtensions"
rmdir /s /q "%APPDATA%\Code\CachedExtensionVSIXs"
```

**Linux/Mac:**
```bash
rm -rf ~/.vscode/extensions/*claude-commit*
```

#### 1.3 Установите новую версию

```bash
cd E:\work\vscode-workspaces\vscode-claude-commit
code --install-extension claude-commit-0.2.0.vsix
```

#### 1.4 Перезапустите VSCode ПОЛНОСТЬЮ

Закройте все окна VSCode и откройте заново.

---

### ✅ ШАГ 2: Проверьте установку

#### 2.1 Откройте Extensions

`Ctrl+Shift+X`

Найдите "Claude Commit Message Generator"

**Должно быть:**
- ✅ Включено (галочка)
- ✅ Версия: 0.2.0
- ✅ Без ошибок

#### 2.2 Проверьте Output

`Ctrl+Shift+U` → выберите "Extension Host"

**Должно быть:**
```
Claude Commit extension is now active
```

Если этого сообщения нет - расширение не активировалось!

#### 2.3 Проверьте Developer Console

`Help` → `Toggle Developer Tools` → вкладка `Console`

Ищите ошибки, связанные с расширением.

---

### ✅ ШАГ 3: Тестирование в режиме разработки

Если установка не работает, попробуйте режим разработки:

#### 3.1 Откройте проект расширения

```bash
code E:\work\vscode-workspaces\vscode-claude-commit
```

#### 3.2 Запустите в режиме отладки

Нажмите `F5`

Откроется новое окно "[Extension Development Host]"

#### 3.3 Проверьте логи

В **исходном** окне VSCode смотрите Debug Console.

Должно быть:
```
Claude Commit extension is now active
```

#### 3.4 Попробуйте команду в новом окне

В окне Extension Development Host:

1. Откройте git репозиторий (любой)
2. `Ctrl+Shift+P` → "Generate Commit Message with Claude"
3. Если команда НЕ найдена - смотрите ошибки в Debug Console

---

### ✅ ШАГ 4: Альтернативный способ активации

Если ничего не помогает, попробуем активировать вручную:

#### 4.1 Откройте Command Palette

`Ctrl+Shift+P`

#### 4.2 Введите:

```
>Developer: Show Running Extensions
```

#### 4.3 Найдите "claude-commit"

Если его нет в списке - расширение не загрузилось.

**Возможные причины:**
- Ошибка в package.json
- Ошибка в extension.js
- Конфликт с другим расширением

---

### ✅ ШАГ 5: Проверьте зависимости

#### 5.1 Проверьте, что node_modules не включены в vsix

```bash
# В папке проекта
code --install-extension claude-commit-0.2.0.vsix --force
```

Расширение должно устанавливаться быстро (< 1 секунда)

Если медленно - возможно node_modules включены (не должны быть!)

#### 5.2 Проверьте размер vsix

```bash
ls -lh claude-commit-0.2.0.vsix
```

Должно быть: ~25-30 KB

Если больше 1 MB - что-то не так с упаковкой!

---

### ✅ ШАГ 6: Проверьте конфликты

Некоторые расширения могут конфликтовать:

1. Временно отключите ВСЕ другие расширения
2. Перезапустите VSCode
3. Попробуйте установить claude-commit снова
4. Если работает - включайте расширения по одному

---

### ✅ ШАГ 7: Создайте минимальный тест

#### 7.1 Создайте тестовый репозиторий

```bash
mkdir ~/test-claude-commit
cd ~/test-claude-commit
git init
echo "test" > test.txt
git add test.txt
```

#### 7.2 Откройте в VSCode

```bash
code ~/test-claude-commit
```

#### 7.3 Попробуйте команду

`Ctrl+Shift+G` → Нажмите ✨ (sparkle icon)

**ИЛИ**

`Ctrl+Shift+P` → "Generate Commit Message with Claude"

---

## Диагностика по симптомам

### Симптом: Команда не найдена

**Причина:** Расширение не активировалось

**Решение:**
1. Проверьте Output → Extension Host
2. Должно быть: "Claude Commit extension is now active"
3. Если нет - смотрите ошибки в Developer Tools

### Симптом: Иконка ✨ не отображается

**Причина:** Git репозиторий не обнаружен ИЛИ расширение не активировалось

**Решение:**
1. Убедитесь, что открыта папка с .git
2. `git status` должен работать
3. Попробуйте команду через Command Palette

### Симптом: Команда есть, но ошибка при выполнении

**Причина:** Проблема с кодом расширения

**Решение:**
1. Смотрите ошибку в Developer Tools
2. Проверьте настройки (Provider, API Key, AWS credentials)
3. Запустите в режиме разработки (F5)

---

## Быстрая проверка: работает ли расширение?

```bash
# 1. Установите
code --install-extension claude-commit-0.2.0.vsix

# 2. Перезапустите VSCode полностью

# 3. Проверьте
code --list-extensions | grep claude

# Должно вывести что-то вроде:
# your-publisher-name.claude-commit

# 4. Откройте любой git repo
cd /path/to/any/git/repo
code .

# 5. Нажмите Ctrl+Shift+P
# 6. Введите "Generate Commit"
# 7. Должна появиться команда: "Generate Commit Message with Claude"
```

---

## Если ничего не помогает

### Последний вариант: Запуск напрямую из исходников

1. Откройте проект:
   ```bash
   code E:\work\vscode-workspaces\vscode-claude-commit
   ```

2. Нажмите `F5`

3. В новом окне Extension Development Host:
   - Откройте любой git repo
   - Используйте расширение

4. Это всегда должно работать!

---

## Актуальная конфигурация

### activationEvents

Сейчас в package.json:

```json
"activationEvents": [
  "*"
]
```

Это означает: активировать **немедленно** при запуске VSCode.

### Альтернативы (если не работает)

Попробуйте изменить на:

```json
"activationEvents": [
  "onCommand:claude-commit.generate",
  "workspaceContains:**/.git"
]
```

Это активирует:
- При вызове команды
- При открытии папки с .git

---

## Логи для отладки

Соберите эти логи и отправьте, если нужна помощь:

1. **Extension Host Output:**
   `Ctrl+Shift+U` → Extension Host → скопируйте все

2. **Developer Console:**
   Help → Toggle Developer Tools → Console → скопируйте ошибки

3. **Running Extensions:**
   `Ctrl+Shift+P` → Developer: Show Running Extensions → screenshot

4. **Installed Extensions:**
   ```bash
   code --list-extensions --show-versions > extensions.txt
   ```

5. **Package.json:**
   ```bash
   cat package.json | grep -A 10 "activationEvents"
   ```

---

## Контрольный чек-лист

- [ ] VSCode версия >= 1.80.0 (`code --version`)
- [ ] Расширение установлено (`code --list-extensions | grep claude`)
- [ ] VSCode полностью перезапущен
- [ ] Git репозиторий открыт
- [ ] Нет ошибок в Extension Host output
- [ ] Команда появляется в Command Palette
- [ ] Иконка ✨ видна в Source Control (если открыт git repo)

---

## Полезные команды VSCode

```bash
# Список расширений
code --list-extensions

# Удалить расширение
code --uninstall-extension publisher.extension-name

# Установить расширение
code --install-extension path/to/extension.vsix

# Версия VSCode
code --version

# Логи VSCode
code --log trace

# Отключить все расширения (safe mode)
code --disable-extensions
```

---

**Если после всех шагов не работает - запустите через F5 (режим разработки)!**

Это ВСЕГДА должно работать, и поможет понять, в чём проблема.
