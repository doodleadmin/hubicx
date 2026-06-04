"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatOptionLabel, Locale, t } from "@/lib/i18n";

export type HubicxSelectOption = string | number | { label?: string; value: string | number };

type NormalizedOption = {
  label: string;
  value: string | number;
};

function normalizeOption(option: HubicxSelectOption, locale: Locale): NormalizedOption {
  if (typeof option === "object") {
    return { value: option.value, label: option.label || formatOptionLabel(locale, option.value) };
  }
  return { value: option, label: formatOptionLabel(locale, option) };
}

export default function HubicxSelect({
  id,
  value,
  options,
  disabled,
  loading,
  error,
  locale = "ru",
  placeholder,
  onChange,
}: {
  id?: string;
  value?: string | number;
  options: HubicxSelectOption[];
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  locale?: Locale;
  placeholder?: string;
  onChange: (value: string | number) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const normalizedOptions = useMemo(() => options.map((option) => normalizeOption(option, locale)), [locale, options]);
  const selected = normalizedOptions.find((option) => String(option.value) === String(value));

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return <div ref={rootRef} className="relative">
    <button
      id={id}
      type="button"
      className={`hubicx-input flex items-center justify-between gap-3 text-left shadow-soft-sm ${open ? "border-brand-primary ring-4 ring-brand-glow" : ""} ${error ? "border-danger/70" : ""}`}
      disabled={disabled || loading}
      aria-haspopup="listbox"
      aria-expanded={open}
      onClick={() => setOpen((next) => !next)}
    >
      <span className={selected ? "text-ink-primary" : "text-ink-muted"}>{loading ? t(locale, "common.loading") : selected?.label || placeholder || t(locale, "common.loading")}</span>
      <span className={`text-sm text-brand-primary transition ${open ? "rotate-180" : ""}`}>⌄</span>
    </button>
    {open && <div className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-[20px] border border-[#E5EEF8] bg-white p-1 shadow-soft-md" role="listbox">
      {normalizedOptions.map((option) => {
        const isSelected = String(option.value) === String(value);
        return <button
          key={String(option.value)}
          type="button"
          className={`w-full rounded-[14px] px-4 py-3 text-left text-sm transition hover:bg-[#EAF4FF] active:bg-[#D9ECFF] ${isSelected ? "bg-[#EAF4FF] font-semibold text-[#0084F0]" : "text-ink-primary"}`}
          role="option"
          aria-selected={isSelected}
          onClick={() => {
            onChange(option.value);
            setOpen(false);
          }}
        >
          {option.label}
        </button>;
      })}
    </div>}
    {error && <p className="mt-1 text-xs font-semibold text-danger">{error}</p>}
  </div>;
}
