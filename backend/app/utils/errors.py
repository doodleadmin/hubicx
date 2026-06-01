class AppError(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)


ERROR_MESSAGES = {
    "not_enough_balance": "Недостаточно кредитов на балансе",
    "model_not_found": "Модель не найдена",
    "model_inactive": "Модель временно отключена",
    "template_not_found": "Шаблон не найден",
    "invalid_init_data": "Не удалось проверить Telegram WebApp",
    "provider_api_key_missing": "API ключ провайдера не настроен",
    "provider_model_not_configured": "Model provider ID is not configured",
    "provider_timeout": "Провайдер не ответил вовремя",
    "provider_error": "Ошибка провайдера генерации",
    "generation_failed": "Генерация не удалась",
    "file_too_large": "Файл слишком большой",
    "unsupported_file_type": "Тип файла не поддерживается",
}
