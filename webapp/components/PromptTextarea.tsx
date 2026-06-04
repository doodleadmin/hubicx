import { Locale, t } from "@/lib/i18n";

export default function PromptTextarea({ value, onChange, locale = "ru" }: { value: string; onChange: (value: string) => void; locale?: Locale }) {
  return <label className="block">
    <span className="text-sm font-bold text-ink-primary">{t(locale, "field.prompt")}</span>
    <textarea className="hubicx-input mt-2 min-h-32 resize-none" value={value} onChange={(event) => onChange(event.target.value)} placeholder={t(locale, "field.defaultPrompt")} />
  </label>;
}
