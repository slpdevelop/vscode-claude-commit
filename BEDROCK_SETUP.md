# Настройка AWS Bedrock

Это руководство поможет вам настроить расширение для работы с Claude через AWS Bedrock вместо прямого API Anthropic.

## Преимущества AWS Bedrock

- ✅ Не нужен API ключ Anthropic
- ✅ Единая биллинг через AWS
- ✅ Использование существующих AWS credentials
- ✅ Соответствие корпоративным политикам безопасности
- ✅ VPC и private endpoint support

## Предварительные требования

### 1. AWS Account с доступом к Bedrock

Убедитесь, что у вас есть:
- AWS аккаунт
- Доступ к Amazon Bedrock
- Включённые модели Claude в Bedrock

### 2. AWS CLI установлен

```bash
# Проверьте установку
aws --version

# Если не установлен, скачайте с:
# https://aws.amazon.com/cli/
```

### 3. AWS Credentials настроены

Есть несколько способов:

#### Способ 1: AWS CLI Configure (самый простой)

```bash
aws configure
```

Введите:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (например: `us-east-1`)
- Output format: `json`

#### Способ 2: Использование профилей

```bash
# Создайте профиль
aws configure --profile bedrock-profile

# Проверьте профиль
aws sts get-caller-identity --profile bedrock-profile
```

#### Способ 3: Environment Variables

```bash
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="us-east-1"
```

#### Способ 4: IAM Role (для EC2/ECS)

Если вы работаете на EC2 инстансе с IAM ролью, credentials будут получены автоматически.

## Включение моделей Claude в Bedrock

### 1. Откройте AWS Console

https://console.aws.amazon.com/bedrock/

### 2. Выберите регион

Bedrock доступен в:
- `us-east-1` (N. Virginia) ← Рекомендуется
- `us-west-2` (Oregon)
- `eu-west-1` (Ireland)
- `ap-southeast-1` (Singapore)
- И другие...

### 3. Request Model Access

1. Перейдите в **Model access** в левом меню
2. Нажмите **Modify model access**
3. Включите модели Claude:
   - ✅ Claude 3.5 Haiku
   - ✅ Claude 3.5 Sonnet
   - ✅ Claude 3 Opus
4. Нажмите **Request model access**
5. Подождите одобрения (обычно мгновенно для Claude)

## Настройка расширения

### 1. Откройте VSCode Settings

`Ctrl+,` (или `Cmd+,` на Mac)

### 2. Найдите "Claude Commit"

### 3. Измените настройки:

| Настройка | Значение | Описание |
|-----------|----------|----------|
| **Provider** | `bedrock` | Переключить с Anthropic на Bedrock |
| **Aws Region** | `us-east-1` | Регион где включён Bedrock |
| **Aws Profile** | (опционально) | Имя AWS CLI профиля |
| **Model** | `claude-haiku-4-5-20251001` | Модель Claude |

### 4. Настройки в JSON

Или отредактируйте `settings.json` напрямую:

```json
{
  "claudeCommit.provider": "bedrock",
  "claudeCommit.awsRegion": "us-east-1",
  "claudeCommit.awsProfile": "",  // оставьте пустым для default credentials
  "claudeCommit.model": "claude-haiku-4-5-20251001"
}
```

## Проверка настройки

### 1. Проверьте AWS Credentials

```bash
# Без профиля (default)
aws sts get-caller-identity

# С профилем
aws sts get-caller-identity --profile your-profile-name
```

Должно вернуть ваш AWS Account ID и User/Role ARN.

### 2. Проверьте доступ к Bedrock

```bash
# Список доступных моделей
aws bedrock list-foundation-models --region us-east-1
```

### 3. Проверьте конкретную модель Claude

```bash
aws bedrock-runtime invoke-model \
  --region us-east-1 \
  --model-id anthropic.claude-3-5-haiku-20241022-v1:0 \
  --body '{"anthropic_version":"bedrock-2023-05-31","max_tokens":100,"messages":[{"role":"user","content":"Hi"}]}' \
  output.json

cat output.json
```

## Использование

После настройки использование **точно такое же**, как с Anthropic API:

1. Откройте Source Control (`Ctrl+Shift+G`)
2. Нажмите ✨ (sparkle icon)
3. Подождите генерации
4. Выберите "Use Message" или "Edit & Use"

Расширение автоматически использует Bedrock вместо Anthropic API!

## Маппинг моделей

Расширение автоматически конвертирует названия моделей:

| VSCode Setting | Bedrock Model ID |
|----------------|------------------|
| `claude-haiku-4-5-20251001` | `anthropic.claude-3-5-haiku-20241022-v1:0` |
| `claude-sonnet-4-6` | `anthropic.claude-3-5-sonnet-20241022-v2:0` |
| `claude-opus-4-8` | `anthropic.claude-3-opus-20240229-v1:0` |

**См. также:** [BEDROCK_MODELS.md](BEDROCK_MODELS.md) для деталей

## Стоимость через Bedrock

Цены за 1000 tokens (может отличаться по регионам):

| Модель | Input | Output |
|--------|-------|--------|
| Claude Haiku 4.5 | $0.001 | $0.005 |
| Claude Sonnet 4.6 | $0.003 | $0.015 |
| Claude Opus 4.8 | $0.015 | $0.075 |

Типичный commit message: ~500 input tokens + ~100 output tokens

**Haiku**: ~$0.0005 - $0.001 за commit ← Рекомендуется

## Troubleshooting

### "AccessDeniedException"

Ваш AWS user/role не имеет доступа к Bedrock.

**Решение:**
1. Откройте IAM в AWS Console
2. Найдите вашего User или Role
3. Добавьте policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "arn:aws:bedrock:*::foundation-model/anthropic.claude-*"
    }
  ]
}
```

### "Model not found" или "ValidationException"

Модель не включена в вашем регионе.

**Решение:**
1. Перейдите в Bedrock Console
2. Model access → Request model access
3. Включите Claude models
4. Подождите одобрения

### "Unable to locate credentials"

AWS credentials не настроены.

**Решение:**
```bash
aws configure
```

Или проверьте файл `~/.aws/credentials`:
```ini
[default]
aws_access_key_id = YOUR_ACCESS_KEY
aws_secret_access_key = YOUR_SECRET_KEY
```

### "Invalid region"

Bedrock недоступен в выбранном регионе.

**Решение:**
Используйте один из поддерживаемых регионов:
- `us-east-1`
- `us-west-2`
- `eu-west-1`
- `ap-southeast-1`

### Медленные ответы

**Причины:**
- Выбран далёкий регион (высокая latency)
- Throttling от AWS

**Решение:**
- Используйте ближайший регион
- Проверьте Service Quotas в AWS Console

### Profile not found

**Решение:**
```bash
# Посмотрите доступные профили
cat ~/.aws/credentials

# Или удалите profile из настроек, чтобы использовать default
```

## Переключение между Anthropic и Bedrock

Вы можете легко переключаться:

### Использовать Anthropic API:
```json
{
  "claudeCommit.provider": "anthropic",
  "claudeCommit.apiKey": "sk-ant-..."
}
```

### Использовать AWS Bedrock:
```json
{
  "claudeCommit.provider": "bedrock",
  "claudeCommit.awsRegion": "us-east-1"
}
```

## IAM Policy пример

Минимальная policy для работы расширения:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ClaudeCommitBedrock",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": [
        "arn:aws:bedrock:us-east-1::foundation-model/us.anthropic.claude-haiku-4-5-20251001:0",
        "arn:aws:bedrock:us-east-1::foundation-model/us.anthropic.claude-sonnet-4-6:0",
        "arn:aws:bedrock:us-east-1::foundation-model/us.anthropic.claude-opus-4-8:0"
      ]
    }
  ]
}
```

## Дополнительная безопасность

### Использование VPC Endpoint

Для работы в private network:

1. Создайте VPC Endpoint для Bedrock
2. Настройте Security Groups
3. AWS SDK автоматически использует VPC endpoint

### Использование AWS SSO

```bash
# Настройте SSO
aws configure sso

# Войдите
aws sso login --profile your-sso-profile

# В настройках расширения:
# claudeCommit.awsProfile = "your-sso-profile"
```

## Cross-region usage

Модели могут быть доступны в разных регионах:

```json
{
  "claudeCommit.awsRegion": "eu-west-1"  // Для EU compliance
}
```

## Логирование и мониторинг

AWS CloudTrail автоматически логирует все вызовы Bedrock API:

1. Откройте CloudTrail в AWS Console
2. Найдите события `InvokeModel`
3. Смотрите кто, когда и какую модель использовал

## Полезные ссылки

- [AWS Bedrock Документация](https://docs.aws.amazon.com/bedrock/)
- [Claude on Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-claude.html)
- [AWS CLI Configuration](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)
- [Bedrock Pricing](https://aws.amazon.com/bedrock/pricing/)
- [IAM Policies](https://docs.aws.amazon.com/bedrock/latest/userguide/security-iam.html)

---

**Готово!** Теперь вы можете использовать Claude через AWS Bedrock без API ключа Anthropic! 🎉
