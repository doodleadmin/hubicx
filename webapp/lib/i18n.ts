import type { AIModel, FormFieldDef } from "./types";

export type Locale = "ru" | "en" | "es" | "pt";

const SUPPORTED: Locale[] = ["ru", "en", "es", "pt"];

const dictionaries: Record<Locale, Record<string, string>> = {
  ru: {
    "common.loading": "Загрузка...", "common.retry": "Повторить", "common.back": "Назад", "common.openOriginal": "Открыть оригинал", "common.close": "Закрыть",
    "auth.openViaTelegramBot": "Откройте WebApp через Telegram-бота", "auth.connectionError": "Не удалось подключиться к WebApp. Откройте его через Telegram-бота или попробуйте ещё раз.",
    "home.platform": "AI-платформа", "home.title": "Фото, видео и текст в одном месте", "home.subtitle": "Описывайте идею простыми словами, выбирайте модель и получайте результат прямо в Telegram.", "home.start": "Начать", "home.images": "Изображения", "home.imagesDesc": "Создавайте визуалы и идеи", "home.video": "Видео", "home.videoDesc": "Генерируйте ролики из текста", "home.text": "Текст", "home.textDesc": "Пишите и улучшайте тексты", "home.templates": "Шаблоны", "home.templatesDesc": "Быстрые сценарии для задач", "home.quickActions": "Быстрые действия", "home.balance": "Баланс", "home.history": "История", "home.myWorks": "Мои работы", "home.admin": "Админка",
    "docs.title": "Документация", "docs.description": "Краткая справка по моделям, стоимости и результатам Hubicx.", "docs.modelsTitle": "Модели", "docs.modelsText": "Выберите модель под задачу: изображения, видео, текст или готовый шаблон. В формах показаны только параметры, которые важны для результата или стоимости.", "docs.pricingTitle": "Стоимость", "docs.pricingText": "Стоимость считается до запуска. На цену могут влиять количество изображений, качество, разрешение и длительность видео.", "docs.resultsTitle": "История и файлы", "docs.resultsText": "Готовые результаты хранятся в истории. Оттуда можно открыть файл, отправить его в Telegram или повторить генерацию.",
    "generate.studio": "Hubicx Studio", "generate.parameters": "Параметры", "generate.whatCreate": "Что создаём?", "generate.advancedSettings": "Дополнительные настройки", "generate.hideSettings": "Скрыть настройки", "generate.currentBalance": "Баланс", "generate.cost": "Стоимость", "generate.credits": "кредитов", "generate.generate": "Сгенерировать", "generate.generating": "Генерируем...", "generate.creatingTask": "Создаём задачу...", "generate.notEnoughCredits": "Недостаточно кредитов: нужно {cost}, у вас {balance}", "generate.describeWhatCreate": "Опишите, что нужно создать", "generate.requiredFiles": "Загрузите обязательные файлы", "generate.recalculating": "Пересчитываем стоимость...", "generate.finalCostHint": "Финальная стоимость будет рассчитана при запуске", "generate.uploadingFile": "Загружаем файл...",
    "result.title": "Результат", "result.text": "Текст", "result.sendText": "Отправить текст в Telegram", "result.sendFile": "Отправить файл в Telegram", "result.sendingText": "Отправляем текст...", "result.sendingFile": "Отправляем файл...", "result.textSent": "Текст отправлен в Telegram", "result.fileSent": "Файл отправлен в Telegram", "result.textSendError": "Не удалось отправить текст", "result.fileSendError": "Не удалось отправить файл", "result.generateAgain": "Создать ещё раз",
    "status.created": "Задача создана", "status.queued": "В очереди", "status.processing": "Создаём результат", "status.completed": "Готово", "status.refunded": "Ошибка, кредиты возвращены", "status.failed": "Ошибка генерации",
    "history.works": "Ваши работы", "history.title": "История", "history.subtitle": "Здесь хранятся последние генерации и готовые файлы.", "history.all": "Все", "history.image": "Фото", "history.video": "Видео", "history.text": "Текст", "history.template": "Шаблоны", "history.emptyTitle": "Пока нет генераций", "history.emptySubtitle": "Создайте первое изображение, видео или текст.", "history.openResult": "Открыть результат",
    "balance.kicker": "Кредиты Hubicx", "balance.title": "Баланс", "balance.description": "Кредиты используются для генерации фото, видео и текста.", "balance.current": "Текущий баланс", "balance.onlyAfterStart": "Кредиты списываются только после запуска генерации.", "balance.topUp": "Пополнение", "balance.topUpSoon": "Платежи появятся позже. Сейчас доступны тестовые пакеты для проверки сценариев.", "balance.testPackage": "Тестовый пакет", "balance.refCode": "Реферальный код",
    "upload.file": "Файл для обработки", "upload.chooseFile": "Выберите файл", "upload.chooseFiles": "Выберите файлы", "upload.remove": "Удалить", "upload.helper": "Добавьте ссылку на исходный файл, если шаблону нужен входной материал.", "upload.materialHint": "PNG, JPG, WebP или видео по настройкам модели", "upload.multiHint": "Можно загрузить несколько материалов",
    "field.prompt": "Промт", "field.aspect_ratio": "Соотношение сторон", "field.resolution": "Разрешение", "field.quality": "Качество", "field.num_images": "Количество", "field.reference_photos": "Фото-референсы", "field.duration": "Длительность", "field.output_format": "Формат", "field.image_url": "Изображение", "field.end_image_url": "Финальный кадр", "field.system_prompt": "Системный промт", "field.seed": "Seed", "field.safety_tolerance": "Уровень безопасности", "field.negative_prompt": "Негативный промт", "field.generate_audio": "Генерировать звук", "field.defaultPrompt": "Опишите, что нужно создать", "field.motionPrompt": "Опишите движение",
    "error.not_enough_balance": "Недостаточно кредитов на балансе", "error.validation_error": "Проверьте параметры генерации", "error.model_inactive": "Модель временно отключена", "error.file_not_found": "Файл не найден", "error.unauthorized": "Нужно открыть WebApp через Telegram", "error.forbidden": "Доступ запрещён", "error.default": "Не удалось выполнить запрос. Попробуйте ещё раз.",
  },
  en: {
    "common.loading": "Loading...", "common.retry": "Retry", "common.back": "Back", "common.openOriginal": "Open original", "common.close": "Close",
    "auth.openViaTelegramBot": "Open WebApp via the Telegram bot", "auth.connectionError": "Could not connect to WebApp. Open it via the Telegram bot or try again.",
    "home.platform": "AI platform", "home.title": "Images, video and text in one place", "home.subtitle": "Describe your idea, choose a model and get the result right in Telegram.", "home.start": "Start", "home.images": "Images", "home.imagesDesc": "Create visuals and ideas", "home.video": "Video", "home.videoDesc": "Generate clips from text", "home.text": "Text", "home.textDesc": "Write and improve texts", "home.templates": "Templates", "home.templatesDesc": "Fast scenarios for tasks", "home.quickActions": "Quick actions", "home.balance": "Balance", "home.history": "History", "home.myWorks": "My works", "home.admin": "Admin",
    "docs.title": "Docs", "docs.description": "Short guide to Hubicx models, pricing and results.", "docs.modelsTitle": "Models", "docs.modelsText": "Choose a model for images, video, text or a ready template. Forms show only parameters that matter for the result or price.", "docs.pricingTitle": "Pricing", "docs.pricingText": "Cost is calculated before launch. Image count, quality, resolution and video duration may affect the price.", "docs.resultsTitle": "History and files", "docs.resultsText": "Ready results are stored in History. You can open a file, send it to Telegram or generate again.",
    "generate.studio": "Hubicx Studio", "generate.parameters": "Parameters", "generate.whatCreate": "What are we creating?", "generate.advancedSettings": "Advanced settings", "generate.hideSettings": "Hide settings", "generate.currentBalance": "Balance", "generate.cost": "Cost", "generate.credits": "credits", "generate.generate": "Generate", "generate.generating": "Generating...", "generate.creatingTask": "Creating task...", "generate.notEnoughCredits": "Not enough credits: need {cost}, you have {balance}", "generate.describeWhatCreate": "Describe what you want to create", "generate.requiredFiles": "Upload required files", "generate.recalculating": "Recalculating cost...", "generate.finalCostHint": "Final cost will be calculated on start", "generate.uploadingFile": "Uploading file...",
    "result.title": "Result", "result.text": "Text", "result.sendText": "Send text to Telegram", "result.sendFile": "Send file to Telegram", "result.sendingText": "Sending text...", "result.sendingFile": "Sending file...", "result.textSent": "Text sent to Telegram", "result.fileSent": "File sent to Telegram", "result.textSendError": "Could not send text", "result.fileSendError": "Could not send file", "result.generateAgain": "Generate again",
    "status.created": "Task created", "status.queued": "Queued", "status.processing": "Creating result", "status.completed": "Ready", "status.refunded": "Error, credits refunded", "status.failed": "Generation error",
    "history.works": "Your works", "history.title": "History", "history.subtitle": "Recent generations and ready files are stored here.", "history.all": "All", "history.image": "Images", "history.video": "Video", "history.text": "Text", "history.template": "Templates", "history.emptyTitle": "No generations yet", "history.emptySubtitle": "Create your first image, video or text.", "history.openResult": "Open result",
    "balance.kicker": "Hubicx credits", "balance.title": "Balance", "balance.description": "Credits are used for image, video and text generation.", "balance.current": "Current balance", "balance.onlyAfterStart": "Credits are charged only after generation starts.", "balance.topUp": "Top up", "balance.topUpSoon": "Payments are coming later. Test packages are available for scenario checks now.", "balance.testPackage": "Test package", "balance.refCode": "Referral code",
    "upload.file": "File to process", "upload.chooseFile": "Choose file", "upload.chooseFiles": "Choose files", "upload.remove": "Remove", "upload.helper": "Add a source file link if the template needs input material.", "upload.materialHint": "PNG, JPG, WebP or video according to model settings", "upload.multiHint": "You can upload multiple materials",
    "field.prompt": "Prompt", "field.aspect_ratio": "Aspect ratio", "field.resolution": "Resolution", "field.quality": "Quality", "field.num_images": "Number of images", "field.reference_photos": "Reference photos", "field.duration": "Duration", "field.output_format": "Format", "field.image_url": "Image", "field.end_image_url": "End frame", "field.system_prompt": "System prompt", "field.seed": "Seed", "field.safety_tolerance": "Safety level", "field.negative_prompt": "Negative prompt", "field.generate_audio": "Generate audio", "field.defaultPrompt": "Describe what you want to create", "field.motionPrompt": "Describe the motion",
    "error.not_enough_balance": "Not enough credits", "error.validation_error": "Check generation parameters", "error.model_inactive": "This model is temporarily disabled", "error.file_not_found": "File not found", "error.unauthorized": "Open WebApp via Telegram", "error.forbidden": "Access denied", "error.default": "Could not complete the request. Try again.",
  },
  es: {},
  pt: {},
};

dictionaries.es = { ...dictionaries.en,
  "auth.openViaTelegramBot": "Abre WebApp desde el bot de Telegram", "auth.connectionError": "No se pudo conectar a WebApp. Ábrelo desde el bot o inténtalo de nuevo.",
  "home.platform": "Plataforma de IA", "home.title": "Imágenes, video y texto en un solo lugar", "home.subtitle": "Describe tu idea, elige un modelo y recibe el resultado en Telegram.", "home.start": "Empezar", "home.images": "Imágenes", "home.imagesDesc": "Crea visuales e ideas", "home.video": "Video", "home.videoDesc": "Genera clips desde texto", "home.text": "Texto", "home.textDesc": "Escribe y mejora textos", "home.templates": "Plantillas", "home.templatesDesc": "Escenarios rápidos para tareas", "home.quickActions": "Acciones rápidas", "home.balance": "Saldo", "home.history": "Historial", "home.myWorks": "Mis trabajos", "home.admin": "Admin",
  "docs.title": "Documentación", "docs.description": "Guía breve de modelos, precios y resultados de Hubicx.", "docs.modelsTitle": "Modelos", "docs.modelsText": "Elige un modelo para imágenes, video, texto o una plantilla. Los formularios muestran solo parámetros importantes para el resultado o precio.", "docs.pricingTitle": "Precio", "docs.pricingText": "El costo se calcula antes de iniciar. Cantidad de imágenes, calidad, resolución y duración pueden cambiar el precio.", "docs.resultsTitle": "Historial y archivos", "docs.resultsText": "Los resultados listos se guardan en Historial. Puedes abrir un archivo, enviarlo a Telegram o generar otra vez.",
  "generate.parameters": "Parámetros", "generate.whatCreate": "¿Qué creamos?", "generate.advancedSettings": "Ajustes avanzados", "generate.hideSettings": "Ocultar ajustes", "generate.currentBalance": "Saldo", "generate.cost": "Costo", "generate.credits": "créditos", "generate.generate": "Generar", "generate.generating": "Generando...", "generate.creatingTask": "Creando tarea...", "generate.notEnoughCredits": "Créditos insuficientes: necesitas {cost}, tienes {balance}", "generate.describeWhatCreate": "Describe lo que quieres crear", "generate.requiredFiles": "Sube los archivos obligatorios", "generate.recalculating": "Recalculando costo...", "generate.finalCostHint": "El costo final se calculará al iniciar", "generate.uploadingFile": "Subiendo archivo...",
  "result.title": "Resultado", "result.text": "Texto", "result.sendText": "Enviar texto a Telegram", "result.sendFile": "Enviar archivo a Telegram", "result.sendingText": "Enviando texto...", "result.sendingFile": "Enviando archivo...", "result.textSent": "Texto enviado a Telegram", "result.fileSent": "Archivo enviado a Telegram", "result.textSendError": "No se pudo enviar el texto", "result.fileSendError": "No se pudo enviar el archivo", "result.generateAgain": "Generar otra vez",
  "status.created": "Tarea creada", "status.queued": "En cola", "status.processing": "Creando resultado", "status.completed": "Listo", "status.refunded": "Error, créditos devueltos", "status.failed": "Error de generación",
  "history.works": "Tus trabajos", "history.title": "Historial", "history.subtitle": "Aquí se guardan generaciones recientes y archivos listos.", "history.all": "Todo", "history.image": "Fotos", "history.video": "Video", "history.text": "Texto", "history.template": "Plantillas", "history.emptyTitle": "Aún no hay generaciones", "history.emptySubtitle": "Crea tu primera imagen, video o texto.", "history.openResult": "Abrir resultado",
  "balance.kicker": "Créditos Hubicx", "balance.title": "Saldo", "balance.description": "Los créditos se usan para generar fotos, video y texto.", "balance.current": "Saldo actual", "balance.onlyAfterStart": "Los créditos se descuentan solo al iniciar la generación.", "balance.topUp": "Recarga", "balance.topUpSoon": "Los pagos llegarán más tarde. Ahora hay paquetes de prueba.", "balance.testPackage": "Paquete de prueba", "balance.refCode": "Código de referido",
  "upload.file": "Archivo para procesar", "upload.chooseFile": "Elegir archivo", "upload.chooseFiles": "Elegir archivos", "upload.remove": "Eliminar", "upload.helper": "Agrega un enlace al archivo fuente si la plantilla lo necesita.", "upload.materialHint": "PNG, JPG, WebP o video según el modelo", "upload.multiHint": "Puedes subir varios materiales",
  "field.aspect_ratio": "Relación de aspecto", "field.resolution": "Resolución", "field.quality": "Calidad", "field.num_images": "Número de imágenes", "field.reference_photos": "Fotos de referencia", "field.duration": "Duración", "field.output_format": "Formato", "field.image_url": "Imagen", "field.end_image_url": "Fotograma final", "field.system_prompt": "Prompt del sistema", "field.safety_tolerance": "Nivel de seguridad", "field.negative_prompt": "Prompt negativo", "field.generate_audio": "Generar audio", "field.defaultPrompt": "Describe lo que quieres crear", "field.motionPrompt": "Describe el movimiento",
  "error.not_enough_balance": "No tienes suficientes créditos", "error.validation_error": "Revisa los parámetros", "error.model_inactive": "Este modelo está desactivado temporalmente", "error.file_not_found": "Archivo no encontrado", "error.unauthorized": "Abre WebApp desde Telegram", "error.forbidden": "Acceso denegado", "error.default": "No se pudo completar la solicitud. Inténtalo de nuevo.",
};

dictionaries.pt = { ...dictionaries.en,
  "auth.openViaTelegramBot": "Abra o WebApp pelo bot do Telegram", "auth.connectionError": "Não foi possível conectar ao WebApp. Abra pelo bot ou tente novamente.",
  "home.platform": "Plataforma de IA", "home.title": "Imagens, vídeo e texto em um só lugar", "home.subtitle": "Descreva sua ideia, escolha um modelo e receba o resultado no Telegram.", "home.start": "Começar", "home.images": "Imagens", "home.imagesDesc": "Crie visuais e ideias", "home.video": "Vídeo", "home.videoDesc": "Gere clipes a partir de texto", "home.text": "Texto", "home.textDesc": "Escreva e melhore textos", "home.templates": "Modelos", "home.templatesDesc": "Cenários rápidos para tarefas", "home.quickActions": "Ações rápidas", "home.balance": "Saldo", "home.history": "Histórico", "home.myWorks": "Meus trabalhos", "home.admin": "Admin",
  "docs.title": "Documentação", "docs.description": "Guia breve de modelos, preços e resultados do Hubicx.", "docs.modelsTitle": "Modelos", "docs.modelsText": "Escolha um modelo para imagens, vídeo, texto ou um template. Os formulários mostram apenas parâmetros importantes para o resultado ou preço.", "docs.pricingTitle": "Preço", "docs.pricingText": "O custo é calculado antes do início. Quantidade de imagens, qualidade, resolução e duração podem alterar o preço.", "docs.resultsTitle": "Histórico e arquivos", "docs.resultsText": "Resultados prontos ficam no Histórico. Você pode abrir o arquivo, enviar ao Telegram ou gerar novamente.",
  "generate.parameters": "Parâmetros", "generate.whatCreate": "O que vamos criar?", "generate.advancedSettings": "Configurações avançadas", "generate.hideSettings": "Ocultar configurações", "generate.currentBalance": "Saldo", "generate.cost": "Custo", "generate.credits": "créditos", "generate.generate": "Gerar", "generate.generating": "Gerando...", "generate.creatingTask": "Criando tarefa...", "generate.notEnoughCredits": "Créditos insuficientes: precisa de {cost}, você tem {balance}", "generate.describeWhatCreate": "Descreva o que deseja criar", "generate.requiredFiles": "Envie os arquivos obrigatórios", "generate.recalculating": "Recalculando custo...", "generate.finalCostHint": "O custo final será calculado ao iniciar", "generate.uploadingFile": "Enviando arquivo...",
  "result.title": "Resultado", "result.text": "Texto", "result.sendText": "Enviar texto ao Telegram", "result.sendFile": "Enviar arquivo ao Telegram", "result.sendingText": "Enviando texto...", "result.sendingFile": "Enviando arquivo...", "result.textSent": "Texto enviado ao Telegram", "result.fileSent": "Arquivo enviado ao Telegram", "result.textSendError": "Não foi possível enviar o texto", "result.fileSendError": "Não foi possível enviar o arquivo", "result.generateAgain": "Gerar novamente",
  "status.created": "Tarefa criada", "status.queued": "Na fila", "status.processing": "Criando resultado", "status.completed": "Pronto", "status.refunded": "Erro, créditos devolvidos", "status.failed": "Erro de geração",
  "history.works": "Seus trabalhos", "history.title": "Histórico", "history.subtitle": "Gerações recentes e arquivos prontos ficam aqui.", "history.all": "Todos", "history.image": "Fotos", "history.video": "Vídeo", "history.text": "Texto", "history.template": "Modelos", "history.emptyTitle": "Ainda não há gerações", "history.emptySubtitle": "Crie sua primeira imagem, vídeo ou texto.", "history.openResult": "Abrir resultado",
  "balance.kicker": "Créditos Hubicx", "balance.title": "Saldo", "balance.description": "Créditos são usados para gerar fotos, vídeo e texto.", "balance.current": "Saldo atual", "balance.onlyAfterStart": "Os créditos são cobrados somente após iniciar a geração.", "balance.topUp": "Recarga", "balance.topUpSoon": "Pagamentos chegarão depois. Agora há pacotes de teste.", "balance.testPackage": "Pacote de teste", "balance.refCode": "Código de indicação",
  "upload.file": "Arquivo para processar", "upload.chooseFile": "Escolher arquivo", "upload.chooseFiles": "Escolher arquivos", "upload.remove": "Remover", "upload.helper": "Adicione um link do arquivo fonte se o modelo precisar de material de entrada.", "upload.materialHint": "PNG, JPG, WebP ou vídeo conforme o modelo", "upload.multiHint": "Você pode enviar vários materiais",
  "field.aspect_ratio": "Proporção", "field.resolution": "Resolução", "field.quality": "Qualidade", "field.num_images": "Número de imagens", "field.reference_photos": "Fotos de referência", "field.duration": "Duração", "field.output_format": "Formato", "field.image_url": "Imagem", "field.end_image_url": "Quadro final", "field.system_prompt": "Prompt do sistema", "field.safety_tolerance": "Nível de segurança", "field.negative_prompt": "Prompt negativo", "field.generate_audio": "Gerar áudio", "field.defaultPrompt": "Descreva o que deseja criar", "field.motionPrompt": "Descreva o movimento",
  "error.not_enough_balance": "Créditos insuficientes", "error.validation_error": "Verifique os parâmetros", "error.model_inactive": "Este modelo está temporariamente desativado", "error.file_not_found": "Arquivo não encontrado", "error.unauthorized": "Abra o WebApp pelo Telegram", "error.forbidden": "Acesso negado", "error.default": "Não foi possível concluir a solicitação. Tente novamente.",
};

export function getLocale(userLanguage?: string | null, telegramLanguage?: string | null): Locale {
  const first = (userLanguage || "").slice(0, 2).toLowerCase() as Locale;
  const second = (telegramLanguage || "").slice(0, 2).toLowerCase() as Locale;
  if (SUPPORTED.includes(first)) return first;
  if (SUPPORTED.includes(second)) return second;
  return "ru";
}

export function t(locale: Locale, key: string, params?: Record<string, string | number>): string {
  let text = dictionaries[locale]?.[key] || dictionaries.ru[key] || key;
  if (params) for (const [name, value] of Object.entries(params)) text = text.replaceAll(`{${name}}`, String(value));
  return text;
}

export function translateError(error: unknown, locale: Locale): string {
  const anyError = error as { code?: string; message?: string };
  if (anyError?.code && dictionaries[locale][`error.${anyError.code}`]) return t(locale, `error.${anyError.code}`);
  const message = anyError?.message || "";
  if (message.includes("баланс") || message.includes("credits")) return t(locale, "error.not_enough_balance");
  if (message.includes("Telegram")) return t(locale, "auth.openViaTelegramBot");
  return message || t(locale, "error.default");
}

const optionLabels: Record<Locale, Record<string, string>> = {
  ru: { square_hd: "Квадрат HD", square: "Квадрат", portrait_4_3: "Портрет 4:3", portrait_16_9: "Портрет 16:9", portrait: "Портрет", landscape_4_3: "Альбом 4:3", landscape_16_9: "Альбом 16:9", landscape: "Альбом" },
  en: { square_hd: "Square HD", square: "Square", portrait_4_3: "Portrait 4:3", portrait_16_9: "Portrait 16:9", portrait: "Portrait", landscape_4_3: "Landscape 4:3", landscape_16_9: "Landscape 16:9", landscape: "Landscape" },
  es: { square_hd: "Cuadrado HD", square: "Cuadrado", portrait_4_3: "Vertical 4:3", portrait_16_9: "Vertical 16:9", portrait: "Vertical", landscape_4_3: "Horizontal 4:3", landscape_16_9: "Horizontal 16:9", landscape: "Horizontal" },
  pt: { square_hd: "Quadrado HD", square: "Quadrado", portrait_4_3: "Retrato 4:3", portrait_16_9: "Retrato 16:9", portrait: "Retrato", landscape_4_3: "Paisagem 4:3", landscape_16_9: "Paisagem 16:9", landscape: "Paisagem" },
};

export function formatOptionLabel(locale: Locale, value: string | number): string {
  const raw = String(value);
  const fixed = { png: "PNG", jpeg: "JPEG", jpg: "JPG", webp: "WEBP", auto: "Auto" } as Record<string, string>;
  if (fixed[raw]) return fixed[raw];
  if (optionLabels[locale][raw]) return optionLabels[locale][raw];
  if (/^\d+p$/.test(raw)) return raw;
  if (/^\d+k$/i.test(raw)) return raw.toUpperCase();
  return raw.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export function localizeField(field: FormFieldDef, locale: Locale): FormFieldDef {
  const key = field.label_key || field.provider_key || field.name;
  return {
    ...field,
    label: dictionaries[locale][`field.${key}`] || field.label,
    placeholder: field.placeholder ? t(locale, "field.defaultPrompt") : field.placeholder,
    helper_text: field.helper_text,
  };
}

const modelTranslations: Record<Locale, Record<string, { title: string; description: string }>> = {
  ru: {},
  en: {
    nano_banana_2: { title: "Nano Banana 2", description: "High quality image generation and editing." },
    nano_banana_pro: { title: "Nano Banana Pro", description: "Advanced image generation with premium settings." },
    nano_banana_edit: { title: "Nano Banana Edit", description: "Edit images from a prompt and source files." },
    flux_schnell: { title: "Fast Image", description: "Fast image generation with Flux Schnell." },
    seedream: { title: "Seedream", description: "Creative image generation with flexible sizes." },
    z_image: { title: "Z-Image", description: "Image generation with acceleration options." },
    ai_chat: { title: "AI Chat", description: "Chat with an AI assistant." },
    prompt_helper: { title: "Prompt Helper", description: "Improve and structure prompts." },
    seedance_2_t2v: { title: "Seedance 2 Text to Video", description: "Generate video from a text prompt." },
    seedance_2_i2v_fast: { title: "Seedance 2 Fast Image to Video", description: "Fast video generation from a start frame." },
    seedance_2_i2v: { title: "Seedance 2 Image to Video", description: "Generate video from an image with advanced quality." },
    kling_21_i2v: { title: "Kling 2.1 Image to Video", description: "Image-to-video generation with Kling 2.1." },
  },
  es: {},
  pt: {},
};
modelTranslations.es = modelTranslations.en;
modelTranslations.pt = modelTranslations.en;

export function localizeModel(model: AIModel, locale: Locale): AIModel {
  const translated = modelTranslations[locale][model.code];
  if (!translated) return model;
  return { ...model, title: translated.title, description: translated.description };
}
