# AWS Bedrock Model IDs

## Mapping: VSCode Settings → Bedrock Model IDs

Расширение автоматически конвертирует названия моделей из настроек VSCode в идентификаторы Bedrock.

| VSCode Setting | Bedrock Model ID | Anthropic API Name |
|----------------|------------------|-------------------|
| `claude-haiku-4-5-20251001` | `anthropic.claude-3-5-haiku-20241022-v1:0` | Claude 3.5 Haiku |
| `claude-sonnet-4-6` | `anthropic.claude-3-5-sonnet-20241022-v2:0` | Claude 3.5 Sonnet |
| `claude-opus-4-8` | `anthropic.claude-3-opus-20240229-v1:0` | Claude 3 Opus |

## Важно!

⚠️ **Bedrock использует другие названия моделей, чем Anthropic API!**

- Anthropic API: `claude-haiku-4-5-20251001`, `claude-sonnet-4-6`, etc.
- Bedrock: `anthropic.claude-3-5-haiku-20241022-v1:0`, etc.

Расширение автоматически делает конвертацию, вам не нужно ничего менять в настройках.

## Как проверить доступные модели в вашем регионе

```bash
# Список всех моделей в Bedrock
aws bedrock list-foundation-models --region us-east-1

# Только Claude модели
aws bedrock list-foundation-models \
  --region us-east-1 \
  --by-provider anthropic \
  --query 'modelSummaries[*].[modelId,modelName]' \
  --output table
```

## Пример вывода:

```
-----------------------------------------------------------
|                ListFoundationModels                      |
+--------------------------------------------------+-------+
|  anthropic.claude-3-5-haiku-20241022-v1:0       | Claude 3.5 Haiku |
|  anthropic.claude-3-5-sonnet-20241022-v2:0      | Claude 3.5 Sonnet |
|  anthropic.claude-3-opus-20240229-v1:0          | Claude 3 Opus |
+--------------------------------------------------+-------+
```

## Тестирование конкретной модели

```bash
# Тест Claude 3.5 Haiku
aws bedrock-runtime invoke-model \
  --region us-east-1 \
  --model-id anthropic.claude-3-5-haiku-20241022-v1:0 \
  --body '{"anthropic_version":"bedrock-2023-05-31","max_tokens":100,"messages":[{"role":"user","content":"Hello"}]}' \
  response.json

cat response.json
```

## Если модель не найдена

### Ошибка: "The provided model identifier is invalid"

**Причины:**

1. Модель не включена в Bedrock Console
2. Модель недоступна в вашем регионе
3. Неправильный идентификатор модели

**Решение:**

1. Откройте Bedrock Console: https://console.aws.amazon.com/bedrock/
2. Выберите ваш регион (us-east-1)
3. Model access → Modify model access
4. Включите Claude модели
5. Дождитесь "Access granted"

### Ошибка: "Could not resolve the foundation model"

Модель не существует в выбранном регионе.

**Решение:**

Проверьте доступность:

```bash
aws bedrock list-foundation-models \
  --region us-east-1 \
  --by-provider anthropic
```

Если модели нет - используйте другой регион или другую модель.

## Доступность по регионам

Claude модели доступны в следующих регионах:

| Регион | Claude 3.5 Haiku | Claude 3.5 Sonnet | Claude 3 Opus |
|--------|------------------|-------------------|---------------|
| us-east-1 | ✅ | ✅ | ✅ |
| us-west-2 | ✅ | ✅ | ✅ |
| eu-west-1 | ✅ | ✅ | ✅ |
| ap-southeast-1 | ✅ | ✅ | ❌ |
| eu-central-1 | ✅ | ✅ | ❌ |

**Рекомендация:** Используйте **us-east-1** - там все модели доступны.

## Изменение модели в настройках

VSCode Settings → Claude Commit → Model

Выберите:
- **Claude Haiku 4.5** (рекомендуется для commit messages)
- **Claude Sonnet 4.6** (для сложных изменений)
- **Claude Opus 4.8** (максимальное качество)

Расширение автоматически использует правильный Bedrock ID.

## Стоимость на Bedrock

| Модель | Input (за 1K tokens) | Output (за 1K tokens) |
|--------|---------------------|----------------------|
| Claude 3.5 Haiku | $0.001 | $0.005 |
| Claude 3.5 Sonnet | $0.003 | $0.015 |
| Claude 3 Opus | $0.015 | $0.075 |

**Типичный commit message:**
- Input: ~500 tokens (git diff)
- Output: ~100 tokens (commit message)

**Стоимость за commit:**
- Haiku: ~$0.001
- Sonnet: ~$0.003
- Opus: ~$0.01

## Cross-region inference

Если модель недоступна в вашем регионе, но доступна в другом:

```json
{
  "claudeCommit.awsRegion": "us-east-1"
}
```

Все запросы будут идти в us-east-1, независимо от вашего физического местоположения.

## Обновление моделей

AWS периодически добавляет новые версии Claude.

Чтобы использовать новую модель:

1. Обновите `getBedrockModelId()` в `src/commitGenerator.ts`
2. Добавьте новый ID в маппинг
3. Перекомпилируйте: `npm run compile`
4. Пересоздайте пакет: `npm run package`

## Отладка

Если модель не работает, проверьте логи:

```bash
# CloudTrail - логи всех вызовов Bedrock
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=ResourceType,AttributeValue=AWS::Bedrock::Model \
  --max-items 10

# Или в CloudWatch Logs
aws logs tail /aws/bedrock/modelinvocations --follow
```

## Полезные ссылки

- [Bedrock Model IDs](https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html)
- [Claude on Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-anthropic-claude.html)
- [Bedrock Pricing](https://aws.amazon.com/bedrock/pricing/)
- [Model Access](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html)

---

**Теперь расширение использует правильные Bedrock model IDs!** ✅
