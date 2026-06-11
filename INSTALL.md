# Установка расширения

Расширение упаковано в файл: **claude-commit-0.2.0.vsix**

## Способ 1: Установка через VSCode UI (рекомендуется)

### Шаг 1: Откройте VSCode

### Шаг 2: Откройте панель Extensions
- Нажмите `Ctrl+Shift+X` (или `Cmd+Shift+X` на Mac)
- Или: View → Extensions

### Шаг 3: Установите из VSIX
1. Нажмите на три точки `...` в правом верхнем углу панели Extensions
2. Выберите **"Install from VSIX..."**
3. Найдите файл `claude-commit-0.2.0.vsix` в папке проекта
4. Выберите его и нажмите "Install"

### Шаг 4: Перезапустите VSCode
VSCode может попросить перезапустить окно. Нажмите "Reload".

## Способ 2: Установка через командную строку

```bash
code --install-extension claude-commit-0.2.0.vsix
```

## Проверка установки

1. Откройте Command Palette: `Ctrl+Shift+P`
2. Введите "Generate Commit"
3. Вы должны увидеть: **"Generate Commit Message with Claude"**

## Настройка после установки

### Вариант А: Использование Anthropic API

1. Получите API ключ: https://console.anthropic.com/
2. Откройте Settings: `Ctrl+,`
3. Найдите "Claude Commit"
4. Настройте:
   - **Provider**: `anthropic`
   - **Api Key**: вставьте ваш ключ (начинается с `sk-ant-`)

### Вариант Б: Использование AWS Bedrock (БЕЗ API ключа!)

#### 1. Настройте AWS credentials

```bash
aws configure
```

Введите:
- AWS Access Key ID
- AWS Secret Access Key
- Default region: `us-east-1`
- Output format: `json`

#### 2. Настройте расширение

1. Откройте Settings: `Ctrl+,`
2. Найдите "Claude Commit"
3. Настройте:
   - **Provider**: `bedrock`
   - **Aws Region**: `us-east-1` (или ваш регион)
   - **Aws Profile**: (оставьте пустым для default)

#### 3. Включите модели в AWS Bedrock

1. Откройте: https://console.aws.amazon.com/bedrock/
2. Выберите ваш регион (например, us-east-1)
3. Перейдите в **Model access** в левом меню
4. Нажмите **Modify model access**
5. Включите:
   - ✅ Claude 3.5 Haiku
   - ✅ Claude 3.5 Sonnet
   - ✅ Claude 3 Opus
6. Нажмите **Request model access**

**Детальная инструкция:** См. [BEDROCK_SETUP.md](BEDROCK_SETUP.md)

## Первое использование

### 1. Откройте git репозиторий в VSCode

### 2. Сделайте изменения

```bash
# Пример
echo "console.log('test');" > test.js
git add test.js
```

### 3. Откройте Source Control

Нажмите `Ctrl+Shift+G`

### 4. Сгенерируйте commit message

Нажмите на иконку **✨** (sparkle) в тулбаре Source Control

### 5. Дождитесь генерации

Появится уведомление "Generating commit message with Claude..."

### 6. Используйте сообщение

Выберите:
- **Use Message** - использовать как есть
- **Edit & Use** - отредактировать перед использованием
- **Cancel** - отменить

### 7. Сделайте commit

Нажмите кнопку "Commit" или `Ctrl+Enter`

## Настройки расширения

Все настройки доступны в: Settings → Extensions → Claude Commit

| Настройка | Значение по умолчанию | Описание |
|-----------|----------------------|----------|
| **Provider** | `anthropic` | Провайдер API: `anthropic` или `bedrock` |
| **Api Key** | `""` | API ключ Anthropic (для провайдера `anthropic`) |
| **Aws Region** | `us-east-1` | AWS регион (для провайдера `bedrock`) |
| **Aws Profile** | `""` | AWS профиль (для провайдера `bedrock`) |
| **Model** | `claude-haiku-4-5-20251001` | Модель Claude |
| **Use Conventional Commits** | `true` | Использовать формат Conventional Commits |
| **Analyze All Changes** | `true` | Анализировать все изменения (не только staged) |
| **Max Diff Size** | `50000` | Максимальный размер diff |

## Модели Claude

Доступны 3 модели:

| Модель | Скорость | Качество | Стоимость за commit |
|--------|----------|----------|---------------------|
| **Haiku 4.5** | ⚡⚡⚡ Быстро | ⭐⭐⭐ Хорошо | ~$0.001 |
| **Sonnet 4.6** | ⚡⚡ Средне | ⭐⭐⭐⭐ Отлично | ~$0.01 |
| **Opus 4.8** | ⚡ Медленно | ⭐⭐⭐⭐⭐ Превосходно | ~$0.05 |

**Рекомендация:** Используйте **Haiku 4.5** для большинства задач.

## Conventional Commits

Если включено (по умолчанию), сообщения будут в формате:

```
<type>(<scope>): <subject>

<body>
```

Типы:
- `feat:` - новая функциональность
- `fix:` - исправление бага
- `docs:` - изменения в документации
- `style:` - форматирование кода
- `refactor:` - рефакторинг
- `perf:` - улучшение производительности
- `test:` - добавление тестов
- `chore:` - изменения в сборке

### Пример:

```
feat(auth): add JWT token refresh

Implement automatic token refresh when tokens expire.
Includes retry logic and error handling.
```

## Удаление расширения

### Через UI:
1. Extensions (`Ctrl+Shift+X`)
2. Найдите "Claude Commit Message Generator"
3. Нажмите на шестерёнку → Uninstall

### Через CLI:
```bash
code --uninstall-extension your-publisher-name.claude-commit
```

## Обновление расширения

При появлении новой версии:

1. Удалите старую версию (см. выше)
2. Установите новую версию из нового `.vsix` файла

## Troubleshooting

### "API key not configured"

**Для Anthropic:**
- Проверьте, что Provider = `anthropic`
- Проверьте, что API ключ вставлен в настройках
- API ключ должен начинаться с `sk-ant-`

**Для Bedrock:**
- Проверьте, что Provider = `bedrock`
- Выполните `aws sts get-caller-identity` для проверки credentials

### "No changes detected"

- Убедитесь, что у вас есть незакоммиченные изменения
- Выполните `git status` чтобы увидеть изменения
- Если `analyzeAllChanges = false`, убедитесь что файлы staged: `git add <files>`

### "Extension host terminated unexpectedly"

- Перезапустите VSCode
- Проверьте Output → Extension Host на наличие ошибок

### Медленная генерация

- Используйте модель Haiku вместо Sonnet/Opus
- Уменьшите `maxDiffSize`
- Проверьте размер diff: может быть слишком большой

### Bedrock: "AccessDeniedException"

Ваш AWS user/role не имеет доступа к Bedrock.

**Решение:** Добавьте IAM policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "arn:aws:bedrock:*::foundation-model/anthropic.claude-*"
    }
  ]
}
```

### Bedrock: "Model not found"

Модель не включена в вашем регионе.

**Решение:**
1. Откройте Bedrock Console
2. Model access → Request model access
3. Включите Claude модели

## Дополнительная информация

- **README:** [README.md](README.md)
- **AWS Bedrock Setup:** [BEDROCK_SETUP.md](BEDROCK_SETUP.md)
- **Quick Start:** [QUICK_START.md](QUICK_START.md)
- **Testing Guide:** [TESTING.md](TESTING.md)
- **Changelog:** [CHANGELOG.md](CHANGELOG.md)

## Поддержка

При возникновении проблем:

1. Проверьте [BEDROCK_SETUP.md](BEDROCK_SETUP.md) для Bedrock
2. Проверьте [TESTING.md](TESTING.md) секцию Troubleshooting
3. Создайте issue на GitHub (если доступно)

## Лицензия

MIT License - см. [LICENSE](LICENSE)

---

**Готово!** Расширение установлено и настроено! 🎉

Теперь вы можете генерировать commit messages с помощью Claude AI! ✨
