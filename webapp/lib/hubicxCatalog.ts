import type { Locale } from "./i18n";

export const HUBICX_ASSET = "/hubicx";

type LocalText = Record<Locale, string>;

export function text(value: LocalText, locale: Locale): string {
  return value[locale] || value.ru || value.en;
}

export type CreateTask = {
  id: string;
  category: "image" | "video" | "text" | "prompts";
  icon: string;
  modelCodes: string[];
  title: LocalText;
  description: LocalText;
  badge?: string;
};

export const CREATE_TASKS: CreateTask[] = [
  { id: "create-image", category: "image", icon: "nano_image", modelCodes: ["nano_banana_2", "flux_schnell", "seedream", "z_image"], title: { ru: "Создать изображение", en: "Create image", es: "Crear imagen", pt: "Criar imagem" }, description: { ru: "Генерация по текстовому описанию", en: "Generate visuals from a prompt", es: "Genera visuales desde un prompt", pt: "Gere visuais a partir de um prompt" } },
  { id: "premium-image", category: "image", icon: "nano_star", modelCodes: ["nano_banana_pro"], title: { ru: "Premium Image", en: "Premium Image", es: "Imagen premium", pt: "Imagem premium" }, description: { ru: "Максимум деталей, до 4K", en: "Highest detail, up to 4K", es: "Máximo detalle, hasta 4K", pt: "Máximo detalhe, até 4K" }, badge: "PRO" },
  { id: "edit-photo", category: "image", icon: "nano_edit", modelCodes: ["nano_banana_edit"], title: { ru: "Изменить фото", en: "Edit photo", es: "Editar foto", pt: "Editar foto" }, description: { ru: "Ретушь и стилизация фото", en: "Retouch and restyle source images", es: "Retoque y estilo de fotos", pt: "Retoque e estilo de fotos" } },
  { id: "text-to-video", category: "video", icon: "videocam", modelCodes: ["seedance_2_t2v"], title: { ru: "Видео по тексту", en: "Text to video", es: "Texto a video", pt: "Texto para vídeo" }, description: { ru: "Создайте ролик из описания", en: "Create a clip from a description", es: "Crea un clip desde una descripción", pt: "Crie um clipe a partir de uma descrição" } },
  { id: "image-to-video", category: "video", icon: "img2video", modelCodes: ["seedance_2_i2v_fast", "seedance_2_i2v", "kling_21_i2v"], title: { ru: "Оживить фото", en: "Animate photo", es: "Animar foto", pt: "Animar foto" }, description: { ru: "Превратите изображение в видео", en: "Turn a still image into motion", es: "Convierte una imagen en movimiento", pt: "Transforme uma imagem em movimento" } },
  { id: "ai-chat", category: "text", icon: "chat_pencil", modelCodes: ["ai_chat"], title: { ru: "AI Chat", en: "AI Chat", es: "Chat IA", pt: "Chat IA" }, description: { ru: "Спросить, написать, обсудить", en: "Ask, write, brainstorm", es: "Pregunta, escribe, crea ideas", pt: "Pergunte, escreva, crie ideias" } },
  { id: "prompt-helper", category: "prompts", icon: "swirl", modelCodes: ["prompt_helper"], title: { ru: "Prompt Helper", en: "Prompt Helper", es: "Ayudante de prompts", pt: "Assistente de prompts" }, description: { ru: "Соберём идеальный промпт", en: "Craft a model-ready prompt", es: "Crea un prompt listo", pt: "Crie um prompt pronto" } },
];

export const AGENTS = [
  ["prompt-master", "swirl", "Prompt Master", "Мастер промптов"],
  ["smm", "livestream", "SMM Assistant", "SMM-ассистент"],
  ["brief", "document", "Design Brief Builder", "Конструктор брифов"],
  ["video-script", "video_text", "Video Script Writer", "Сценарист видео"],
  ["product-card", "folder", "Product Card Assistant", "Карточки товаров"],
  ["bot-copy", "send", "Telegram Bot Copywriter", "Копирайтер для ботов"],
  ["ad-creative", "image_flash", "Ad Creative Assistant", "Рекламные креативы"],
  ["translator", "globe", "Translator", "Переводчик"],
].map(([code, icon, en, ru]) => ({ code, icon, title: { ru, en, es: en, pt: en } as LocalText }));

export const TEMPLATE_META: Record<string, { icon: string; cover: string }> = {
  enhance_4k: { icon: "upscale", cover: "sq1" },
  photo_to_prompt: { icon: "prompt_photo", cover: "sq2" },
  chat_to_song: { icon: "song", cover: "sq3" },
  add_beer: { icon: "beer", cover: "sq4" },
  photo_gx: { icon: "g7x", cover: "port1" },
  light_aura: { icon: "halo", cover: "port2" },
  broadcast: { icon: "livestream", cover: "land1" },
  formula_1: { icon: "f1", cover: "land2" },
  doll_unboxing: { icon: "doll", cover: "port3" },
  ai_avatar: { icon: "avatar", cover: "sq1" },
  graduation: { icon: "graduation", cover: "sq2" },
};

export const TEMPLATE_LIST = [
  { code: "enhance_4k", title: { ru: "Улучшить до 4K", en: "Enhance to 4K", es: "Mejorar a 4K", pt: "Melhorar para 4K" }, description: { ru: "Повысить качество изображения", en: "Improve image quality", es: "Mejora la calidad de imagen", pt: "Melhore a qualidade da imagem" } },
  { code: "photo_to_prompt", title: { ru: "Фото в промт", en: "Photo to prompt", es: "Foto a prompt", pt: "Foto para prompt" }, description: { ru: "Получить промт по изображению", en: "Extract a prompt from an image", es: "Obtén un prompt desde una imagen", pt: "Extraia um prompt de uma imagem" } },
  { code: "chat_to_song", title: { ru: "Чат в песню", en: "Chat to song", es: "Chat a canción", pt: "Chat para música" }, description: { ru: "Идея текста для песни", en: "Song lyric idea", es: "Idea de letra", pt: "Ideia de letra" } },
  { code: "add_beer", title: { ru: "Добавить пиво", en: "Add beer", es: "Añadir cerveza", pt: "Adicionar cerveja" }, description: { ru: "Креативный фото-шаблон", en: "Creative photo preset", es: "Preset creativo", pt: "Preset criativo" } },
  { code: "photo_gx", title: { ru: "G7X фото", en: "G7X photo", es: "Foto G7X", pt: "Foto G7X" }, description: { ru: "Стиль компактной камеры", en: "Compact camera style", es: "Estilo cámara compacta", pt: "Estilo câmera compacta" } },
  { code: "light_aura", title: { ru: "Световая аура", en: "Light aura", es: "Aura de luz", pt: "Aura de luz" }, description: { ru: "Мягкая световая обработка", en: "Soft glowing look", es: "Look luminoso suave", pt: "Visual luminoso suave" } },
  { code: "broadcast", title: { ru: "Эфир", en: "Broadcast", es: "Transmisión", pt: "Transmissão" }, description: { ru: "Обложка live-сцены", en: "Live scene cover", es: "Portada live", pt: "Capa live" } },
  { code: "formula_1", title: { ru: "Formula 1", en: "Formula 1", es: "Formula 1", pt: "Formula 1" }, description: { ru: "Динамичный гоночный стиль", en: "Dynamic racing style", es: "Estilo de carrera", pt: "Estilo de corrida" } },
  { code: "doll_unboxing", title: { ru: "Doll Unboxing", en: "Doll Unboxing", es: "Doll Unboxing", pt: "Doll Unboxing" }, description: { ru: "Персонаж в коробке", en: "Character in a box", es: "Personaje en caja", pt: "Personagem na caixa" } },
  { code: "ai_avatar", title: { ru: "AI-аватар", en: "AI avatar", es: "Avatar IA", pt: "Avatar IA" }, description: { ru: "Аватар для профиля", en: "Profile avatar", es: "Avatar de perfil", pt: "Avatar de perfil" } },
  { code: "graduation", title: { ru: "Выпускной", en: "Graduation", es: "Graduación", pt: "Formatura" }, description: { ru: "Праздничный образ", en: "Celebration look", es: "Look festivo", pt: "Visual festivo" } },
];

export function iconPath(name: string): string {
  return `${HUBICX_ASSET}/icons/${name}.png`;
}

export function coverPath(name: string): string {
  return `${HUBICX_ASSET}/cov/${name}.png`;
}

export function phPath(name: string): string {
  return `${HUBICX_ASSET}/ph/${name}.png`;
}
