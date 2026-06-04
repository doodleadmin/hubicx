import { Locale, t } from "@/lib/i18n";

export default function UploadBlock({ value, onChange, locale = "ru" }: { value: string; onChange: (value: string) => void; locale?: Locale }) {
  return <label className="block">
    <span className="text-sm font-bold text-ink-primary">{t(locale, "upload.file")}</span>
    <input className="hubicx-input mt-2" value={value} onChange={(event) => onChange(event.target.value)} placeholder="https://..." />
    <span className="mt-2 block text-xs text-ink-muted">{t(locale, "upload.helper")}</span>
  </label>;
}
