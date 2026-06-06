export type Localized = { en: string; ru: string; es?: string; pt?: string };

export const ASSET = "/hubicx";
export const IC = (name: string) => `${ASSET}/icons/${name}.png`;
export const COV = (name: string) => `${ASSET}/cov/${name}.png`;
export const PH = (name: string) => `${ASSET}/ph/${name}.png`;

export function tt(lang: string, en: string, ru: string, es?: string, pt?: string) {
  if (lang === "ru") return ru;
  if (lang === "es") return es || en;
  if (lang === "pt") return pt || en;
  return en;
}

export function toText(value: Localized, lang: string) {
  if (lang === "ru") return value.ru || value.en;
  if (lang === "es") return value.es || value.en;
  if (lang === "pt") return value.pt || value.en;
  return value.en;
}

export const TASKS = [
  { id: "create-image", cat: "image", model: "nano_banana_2", icon: "nano_image", cost: 40, title: { en: "Create Image", ru: "Создать изображение" }, desc: { en: "Generate from a text prompt", ru: "Генерация по текстовому описанию" } },
  { id: "fast-image", cat: "image", model: "flux_schnell", icon: "image_flash", cost: 30, title: { en: "Fast Image", ru: "Быстрое изображение" }, desc: { en: "Fast clean image generation", ru: "Быстрая генерация изображения" } },
  { id: "seedream", cat: "image", model: "seedream", icon: "swirl", cost: 35, title: { en: "Seedream", ru: "Seedream" }, desc: { en: "Sharp images, fast", ru: "Чёткие изображения, быстро" } },
  { id: "z-image", cat: "image", model: "z_image", icon: "nano_image", cost: 25, title: { en: "Z-Image", ru: "Z-Image" }, desc: { en: "Fast images", ru: "Быстрые изображения" } },
  { id: "premium-image", cat: "image", model: "nano_banana_pro", icon: "nano_star", cost: 80, pro: true, title: { en: "Premium Image", ru: "Премиум изображение" }, desc: { en: "Highest detail, up to 4K", ru: "Максимум деталей, до 4K" } },
  { id: "edit-photo", cat: "image", model: "nano_banana_edit", icon: "nano_edit", cost: 60, title: { en: "Edit Photo", ru: "Редактировать фото" }, desc: { en: "Retouch & restyle your photo", ru: "Ретушь и стилизация фото" } },
  { id: "create-video", cat: "video", model: "seedance_2_t2v", icon: "videocam", cost: 250, title: { en: "Create Video", ru: "Создать видео" }, desc: { en: "Text-to-video clip", ru: "Видео по описанию" } },
  { id: "animate-photo", cat: "video", model: "seedance_2_i2v_fast", icon: "image_planet", cost: 180, title: { en: "Animate Photo", ru: "Оживить фото" }, desc: { en: "Bring a still image to life", ru: "Оживите статичное фото" } },
  { id: "seedance-i2v", cat: "video", model: "seedance_2_i2v", icon: "img2video", cost: 250, title: { en: "Seedance I2V", ru: "Seedance I2V" }, desc: { en: "Image-to-video with 1080p option", ru: "Оживление фото с опцией 1080p" } },
  { id: "kling-i2v", cat: "video", model: "kling_21_i2v", icon: "videocam", cost: 220, title: { en: "Kling 2.1 I2V", ru: "Kling 2.1 I2V" }, desc: { en: "Bring any photo to life", ru: "Оживить любое фото" } },
  { id: "ai-chat", cat: "text", model: "ai_chat", icon: "chat_pencil", cost: 2, title: { en: "AI Chat", ru: "AI-чат" }, desc: { en: "Ask, write, brainstorm", ru: "Спросить, написать, обсудить" } },
  { id: "prompt-helper", cat: "prompt", model: "prompt_helper", icon: "swirl", cost: 2, title: { en: "Prompt Helper", ru: "Помощник промптов" }, desc: { en: "Craft the perfect prompt", ru: "Соберем идеальный промпт" } },
];

export const QUICK = [
  { id: "create-image", icon: "nano_image", label: { en: "Create Image", ru: "Изображение" } },
  { id: "create-video", icon: "videocam", label: { en: "Create Video", ru: "Видео" } },
  { id: "ai-chat", icon: "chat_pencil", label: { en: "AI Chat", ru: "AI-чат" } },
  { id: "templates", icon: "puzzle", label: { en: "Templates", ru: "Шаблоны" } },
  { id: "agents", icon: "users", label: { en: "Agents", ru: "Агенты" } },
];

export const AGENTS = [
  { id: "prompt-master", icon: "swirl", cat: { en: "Prompts", ru: "Промпты" }, title: { en: "Prompt Master", ru: "Мастер промптов" }, desc: { en: "Turns a rough idea into a precise, model-ready prompt.", ru: "Превратит идею в точный готовый промпт." } },
  { id: "smm", icon: "livestream", cat: { en: "Social", ru: "Соцсети" }, title: { en: "SMM Assistant", ru: "SMM-ассистент" }, desc: { en: "Plans posts, captions and content calendars.", ru: "Посты, подписи и контент-план." } },
  { id: "brief", icon: "document", cat: { en: "Design", ru: "Дизайн" }, title: { en: "Design Brief Builder", ru: "Конструктор брифов" }, desc: { en: "Builds a clear creative brief in minutes.", ru: "Соберет понятный креативный бриф." } },
  { id: "video-script", icon: "video_text", cat: { en: "Video", ru: "Видео" }, title: { en: "Video Script Writer", ru: "Сценарист видео" }, desc: { en: "Writes hooks, scenes and voiceover scripts.", ru: "Хуки, сцены и закадровый текст." } },
  { id: "product-card", icon: "folder", cat: { en: "E-com", ru: "E-com" }, title: { en: "Product Card Assistant", ru: "Карточки товаров" }, desc: { en: "Marketplace titles, bullets and descriptions.", ru: "Заголовки и описания для маркетплейсов." } },
  { id: "bot-copy", icon: "send", cat: { en: "Telegram", ru: "Telegram" }, title: { en: "Telegram Bot Copywriter", ru: "Копирайтер для ботов" }, desc: { en: "Friendly bot flows, buttons and replies.", ru: "Сообщения, кнопки и сценарии бота." } },
  { id: "ad-creative", icon: "image_flash", cat: { en: "Ads", ru: "Реклама" }, title: { en: "Ad Creative Assistant", ru: "Рекламные креативы" }, desc: { en: "Angles, headlines and ad concepts that convert.", ru: "Заголовки и идеи для рекламы." } },
  { id: "translator", icon: "globe", cat: { en: "Language", ru: "Языки" }, title: { en: "Translator", ru: "Переводчик" }, desc: { en: "Natural translation across 50+ languages.", ru: "Естественный перевод на 50+ языков." } },
];

export const MODELS = [
  { id: "veo3", name: "Veo 3", cat: "video", task: "create-video", cost: 250, badge: "new", cov: "m1", accent: "#5B8CFF", tagline: { en: "Cinematic video with sound", ru: "Кино-видео со звуком" } },
  { id: "sora2", name: "Sora 2", cat: "video", task: "create-video", cost: 250, badge: "new", cov: "m2", accent: "#C07BFF", tagline: { en: "Hyper-real scenes up to 20s", ru: "Гиперреализм до 20 секунд" } },
  { id: "nano2", name: "Nano Banana 2", cat: "image", task: "create-image", cost: 40, badge: "hot", cov: "m3", accent: "#34C7D6", tagline: { en: "Generate images from text", ru: "Генерация фото по описанию" } },
  { id: "seed4", name: "Seedream 4", cat: "image", task: "seedream", cost: 35, badge: "new", cov: "m4", accent: "#FF7A45", tagline: { en: "Sharp images, fast", ru: "Четкие картинки, быстро" } },
  { id: "kling", name: "Kling 2.1", cat: "video", task: "kling-i2v", cost: 220, badge: null, cov: "m5", accent: "#3BD17A", tagline: { en: "Bring any photo to life", ru: "Оживи любое фото" } },
  { id: "flux2", name: "Flux", cat: "image", task: "fast-image", cost: 30, badge: null, cov: "m6", accent: "#FF5BA6", tagline: { en: "Pro-grade detail & realism", ru: "Профи-детали и реализм" } },
  { id: "hailuo", name: "Seedance", cat: "video", task: "create-video", cost: 180, badge: null, cov: "m7", accent: "#4F97F2", tagline: { en: "Smooth motion", ru: "Плавное движение" } },
  { id: "recr3", name: "Z-Image", cat: "image", task: "z-image", cost: 25, badge: "hot", cov: "m8", accent: "#FFB02E", tagline: { en: "Fast images", ru: "Быстрые изображения" } },
];

export const FEATURED = [
  { id: "veo3", name: "Veo 3", cov: "hero1", task: "create-video", cost: 250, accent: "#5B8CFF", kicker: { en: "Just dropped · Video", ru: "Новинка · Видео" }, title: { en: "Cinematic video, now with sound", ru: "Кино-видео — теперь со звуком" }, desc: { en: "Clips with synced audio, camera moves and dialogue.", ru: "Клипы со звуком, движением камеры и репликами." } },
  { id: "sora2", name: "Sora 2", cov: "hero2", task: "create-video", cost: 250, accent: "#C07BFF", kicker: { en: "Just dropped · Video", ru: "Новинка · Видео" }, title: { en: "Hyper-real scenes from one line", ru: "Гиперреализм из одной строки" }, desc: { en: "Physically accurate, film-grade motion.", ru: "Физически точное кино-движение." } },
  { id: "nano2", name: "Nano Banana 2", cov: "hero3", task: "create-image", cost: 40, accent: "#34C7D6", kicker: { en: "Trending · Image", ru: "В тренде · Фото" }, title: { en: "Create images with one sentence", ru: "Создавай изображения одной фразой" }, desc: { en: "Clean product-ready image generation.", ru: "Быстрая генерация готовых изображений." } },
];

export const TRENDING = [
  { id: "g7x", code: "photo_gx", cov: "w1", uses: "12.4k", cost: 8, title: { en: "Photo on G7X", ru: "Фото на G7X" } },
  { id: "halo", code: "light_aura", cov: "w2", uses: "9.1k", cost: 8, title: { en: "Halo Light", ru: "Halo-свет" } },
  { id: "f1", code: "formula_1", cov: "w3", uses: "7.8k", cost: 10, title: { en: "Formula 1", ru: "Формула 1" } },
];

export const MOTION = [
  { id: "mc1", cov: "port1", pip: "m2" }, { id: "mc2", cov: "port2", pip: "m6" }, { id: "mc3", cov: "port3", pip: "m3" }, { id: "mc4", cov: "land1", pip: "m8" },
];

export const ACTORS = [
  { id: "susan", cov: "port1", name: "Susan", model: "Gemini 3.0 + Kling 2.6" }, { id: "mira", cov: "port2", name: "Mira", model: "Nano Banana + Veo 3.1" }, { id: "leo", cov: "port3", name: "Leo", model: "Seedream 4 + Kling 2.5" }, { id: "nova", cov: "sq4", name: "Nova", model: "Flux 2 + Hailuo 02" },
];

export const TEMPLATES = [
  { id: "upscale", code: "enhance_4k", icon: "upscale", cost: 4, cat: "image", tag: { en: "Hot", ru: "Хит" }, title: { en: "Upscale to 4K", ru: "Апскейл до 4K" }, ph: "sq1" },
  { id: "prompt-photo", code: "photo_to_prompt", icon: "prompt_photo", cost: 2, cat: "text", title: { en: "Prompt by Photo", ru: "Промпт по фото" }, ph: "sq2" },
  { id: "song", code: "chat_to_song", icon: "song", cost: 20, cat: "audio", tag: { en: "New", ru: "New" }, title: { en: "Turn Chat into Song", ru: "Чат в песню" }, ph: "sq3" },
  { id: "beer", code: "add_beer", icon: "beer", cost: 8, cat: "image", title: { en: "Add Beer", ru: "Добавить пиво" }, ph: "sq4" },
  { id: "g7x", code: "photo_gx", icon: "g7x", cost: 8, cat: "image", tag: { en: "Hot", ru: "Хит" }, title: { en: "Photo on G7X", ru: "Фото на G7X" }, ph: "port1" },
  { id: "halo", code: "light_aura", icon: "halo", cost: 8, cat: "image", title: { en: "Halo Light", ru: "Halo-свет" }, ph: "port2" },
  { id: "livestream", code: "broadcast", icon: "livestream", cost: 30, cat: "video", title: { en: "Livestream", ru: "Лайвстрим" }, ph: "land1" },
  { id: "f1", code: "formula_1", icon: "f1", cost: 10, cat: "image", title: { en: "Formula 1", ru: "Формула 1" }, ph: "land2" },
  { id: "doll", code: "doll_unboxing", icon: "doll", cost: 12, cat: "image", tag: { en: "New", ru: "New" }, title: { en: "Doll Unboxing", ru: "Распаковка куклы" }, ph: "port3" },
  { id: "avatar", code: "ai_avatar", icon: "avatar", cost: 10, cat: "image", title: { en: "AI Avatar", ru: "AI-аватар" }, ph: "sq1" },
  { id: "graduation", code: "graduation", icon: "graduation", cost: 8, cat: "image", title: { en: "Graduation", ru: "Выпускной" }, ph: "sq2" },
];

export const RECENT = [
  { id: "r1", cov: "m3", type: "image", icon: "nano_image", name: { en: "Neon city street", ru: "Неоновый город" } },
  { id: "r2", cov: "m8", type: "image", icon: "g7x", name: { en: "Portrait · G7X", ru: "Портрет · G7X" } },
  { id: "r3", cov: "w1", type: "video", icon: "videocam", name: { en: "Ocean flythrough", ru: "Полет над океаном" } },
  { id: "r4", cov: "sq4", type: "image", icon: "nano_star", name: { en: "Product hero", ru: "Геро продукта" } },
];

export const HISTORY = [
  { id: "h1", cov: "m3", kind: "image", icon: "nano_image", status: "done", cost: 40, date: { en: "Today, 14:20", ru: "Сегодня, 14:20" }, name: { en: "Neon city street", ru: "Неоновый город" }, prompt: "Neon-lit rainy street, cinematic, 35mm" },
  { id: "h2", cov: "w1", kind: "video", icon: "videocam", status: "done", cost: 250, date: { en: "Today, 12:05", ru: "Сегодня, 12:05" }, name: { en: "Ocean flythrough", ru: "Полет над океаном" }, prompt: "Drone flythrough over turquoise ocean" },
  { id: "h3", cov: null, kind: "text", icon: "chat_pencil", status: "done", cost: 2, date: { en: "Today, 10:41", ru: "Сегодня, 10:41" }, name: { en: "Launch tweet thread", ru: "Тред к запуску" }, prompt: "Write a 5-tweet launch thread" },
  { id: "h4", cov: "m8", kind: "template", icon: "g7x", status: "done", cost: 8, date: { en: "Yesterday", ru: "Вчера" }, name: { en: "Photo on G7X", ru: "Фото на G7X" }, prompt: "Template · Photo on G7X" },
];

export const PACKAGES = [
  { id: "p1", credits: 100, price: "$1.99", bonus: 0 }, { id: "p2", credits: 550, price: "$8.99", bonus: 50, popular: true }, { id: "p3", credits: 1200, price: "$17.99", bonus: 200 }, { id: "p4", credits: 3000, price: "$39.99", bonus: 700, best: true },
];

export const TX = [
  { id: "t1", icon: "wallet", kind: "topup", amount: "+550", date: { en: "Today, 09:12", ru: "Сегодня, 09:12" }, label: { en: "Top-up · 550 pack", ru: "Пополнение · 550" } },
  { id: "t2", icon: "nano_image", kind: "spend", amount: "-40", date: { en: "Today, 14:20", ru: "Сегодня, 14:20" }, label: { en: "Create Image", ru: "Создать изображение" } },
  { id: "t3", icon: "videocam", kind: "spend", amount: "-250", date: { en: "Today, 12:05", ru: "Сегодня, 12:05" }, label: { en: "Create Video", ru: "Создать видео" } },
];

export const DOCS = [
  { id: "payment", icon: "shield", title: { en: "Payment rules", ru: "Правила оплаты" } },
  { id: "privacy", icon: "shield", title: { en: "Privacy policy", ru: "Политика конфиденциальности" } },
  { id: "terms", icon: "document", title: { en: "Terms of use", ru: "Условия использования" } },
  { id: "support", icon: "send", title: { en: "Support", ru: "Поддержка" } },
];
