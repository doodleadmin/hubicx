"use client";

import { useEffect, useState, useCallback } from "react";
import BalanceCard from "./BalanceCard";
import GenerationStatus from "./GenerationStatus";
import HubicxSelect from "./ui/HubicxSelect";
import { api } from "@/lib/api";
import { getTelegramDebugState, getTelegramLanguageCode, initTelegram, TelegramDebugState } from "@/lib/telegram";
import { getLocale, Locale, localizeField, localizeModel, t, translateError } from "@/lib/i18n";
import { AIModel, FormFieldDef, FormSchema, Generation, PricePreview, User } from "@/lib/types";

const showDebug = process.env.NEXT_PUBLIC_DEBUG === "true";

type UploadedFile = { file_id: number; url: string; name: string };

function TelegramDebugBlock({ debug }: { debug: TelegramDebugState }) {
  return <div className="rounded-2xl border border-border-soft bg-white p-3 text-xs text-ink-secondary">
    <p className="font-semibold text-ink-primary">Debug</p>
    <p>hasWindowTelegram: {String(debug.hasWindowTelegram)}</p>
    <p>hasTelegramWebApp: {String(debug.hasTelegramWebApp)}</p>
    <p>initDataLength: {debug.initDataLength}</p>
    <p>initDataUnsafeUserId: {debug.initDataUnsafeUserId}</p>
    <p>backendUrl: {debug.backendUrl}</p>
    <p className="break-all">currentUrl: {debug.currentUrl}</p>
  </div>;
}

function DynamicField({ field, value, locale, onChange, onFilesChange }: {
  field: FormFieldDef;
  value: unknown;
  locale: Locale;
  onChange: (name: string, value: unknown) => void;
  onFilesChange?: (name: string, files: FileList | null) => void;
}) {
  const { name, label, type, required, placeholder, helper_text, options, min, max, step, accept } = field;

  if (type === "hidden") return null;

  const fieldId = `field-${name}`;

  return <div className="space-y-2">
    <label htmlFor={fieldId} className="text-sm font-bold text-ink-primary">{label}{required ? " *" : ""}</label>
    {type === "textarea" && <textarea id={fieldId} className="hubicx-input min-h-36 resize-none" rows={4} placeholder={placeholder || t(locale, "field.defaultPrompt")} value={String(value || "")} onChange={(e) => onChange(name, e.target.value)} />}
    {type === "text" && <input id={fieldId} type="text" className="hubicx-input" placeholder={placeholder} value={String(value || "")} onChange={(e) => onChange(name, e.target.value)} />}
    {type === "select" && <HubicxSelect id={fieldId} locale={locale} value={(value ?? field.default) as string | number | undefined} options={options || []} onChange={(nextValue) => onChange(name, nextValue)} />}
    {type === "number" && <input id={fieldId} type="number" className="hubicx-input" min={min} max={max} step={step || 1} value={value != null ? String(value) : ""} placeholder={String(field.default ?? "")} onChange={(e) => onChange(name, e.target.value === "" ? field.default : Number(e.target.value))} />}
    {type === "switch" && <label className="flex cursor-pointer items-center gap-3 rounded-input border border-border-soft bg-white px-4 py-3"><input id={fieldId} type="checkbox" className="h-5 w-5 rounded accent-[#0084F0]" checked={Boolean(value)} onChange={(e) => onChange(name, e.target.checked)} /><span className="text-sm font-semibold text-ink-secondary">{label}</span></label>}
    {type === "file" && <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-card border border-dashed border-brand-primary/35 bg-brand-soft/70 p-5 text-center transition hover:bg-brand-soft"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl text-brand-primary shadow-soft-sm">+</span><span className="mt-3 text-sm font-bold text-ink-primary">{t(locale, "upload.chooseFile")}</span><span className="mt-1 text-xs text-ink-secondary">{t(locale, "upload.materialHint")}</span><input id={fieldId} type="file" accept={accept} className="sr-only" onChange={(e) => onFilesChange?.(name, e.target.files)} /></label>}
    {type === "files" && <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-card border border-dashed border-brand-primary/35 bg-brand-soft/70 p-5 text-center transition hover:bg-brand-soft"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl text-brand-primary shadow-soft-sm">+</span><span className="mt-3 text-sm font-bold text-ink-primary">{t(locale, "upload.chooseFiles")}</span><span className="mt-1 text-xs text-ink-secondary">{t(locale, "upload.multiHint")}</span><input id={fieldId} type="file" accept={accept} multiple className="sr-only" onChange={(e) => onFilesChange?.(name, e.target.files)} /></label>}
    {helper_text && type !== "switch" && <p className="text-xs leading-5 text-ink-muted">{helper_text}</p>}
  </div>;
}

function getDefaults(schema: FormSchema): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  for (const f of schema.fields) {
    if (f.default !== undefined) defaults[f.name] = f.default;
  }
  return defaults;
}

export default function ModelForm({ modelCode }: { modelCode: string }) {
  const [model, setModel] = useState<AIModel>();
  const [user, setUser] = useState<User>();
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [fileIds, setFileIds] = useState<Record<string, number[]>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile[]>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [task, setTask] = useState<Generation>();
  const [error, setError] = useState("");
  const [authReady, setAuthReady] = useState(false);
  const [debug, setDebug] = useState<TelegramDebugState>();
  const [submitting, setSubmitting] = useState(false);
  const [refreshedTaskId, setRefreshedTaskId] = useState<number>();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [pricePreview, setPricePreview] = useState<PricePreview>();
  const [pricePreviewLoading, setPricePreviewLoading] = useState(false);
  const [pricePreviewError, setPricePreviewError] = useState(false);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const [locale, setLocale] = useState<Locale>("ru");

  const schema = model?.form_schema as FormSchema | undefined;
  const localizedModel = model ? localizeModel(model, locale) : undefined;
  const localizedSchema = schema ? { ...schema, fields: schema.fields.map((field) => localizeField(field, locale)) } : undefined;

  useEffect(() => {
    let cancelled = false;
    setLoadingTimedOut(false);
    async function load() {
      try {
        const auth = await initTelegram();
        if (cancelled) return;
        if (!auth.hasTelegramWebApp || !auth.initData) {
          if (showDebug) setDebug(getTelegramDebugState());
          setLocale(getLocale(undefined, getTelegramLanguageCode()));
          setError(t(getLocale(undefined, getTelegramLanguageCode()), "auth.openViaTelegramBot"));
          return;
        }
        setAuthReady(true);
        const [m, u] = await Promise.all([api.model(modelCode), api.me()]);
        if (!cancelled) {
          const nextLocale = getLocale((u as User).language_code, getTelegramLanguageCode());
          setLocale(nextLocale);
          setModel(m as AIModel);
          setUser(u as User);
          const ms = (m as AIModel).form_schema;
          if (ms) setFormValues(getDefaults(ms));
        }
      } catch (e) {
        if (!cancelled) {
          setError(translateError(e, getLocale(undefined, getTelegramLanguageCode())));
        }
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [modelCode]);

  useEffect(() => {
    if (error || (authReady && model && user)) return;
    const timer = setTimeout(() => setLoadingTimedOut(true), 5000);
    return () => clearTimeout(timer);
  }, [authReady, error, model, user]);

  useEffect(() => {
    if (!authReady || !task || !["queued", "processing", "created"].includes(task.status)) return;
    const timer = setInterval(() => api.task(task.id).then((next) => setTask(next as Generation)).catch(() => undefined), 2500);
    return () => clearInterval(timer);
  }, [authReady, task]);

  useEffect(() => {
    if (!authReady || !task || refreshedTaskId === task.id || !["completed", "refunded", "failed"].includes(task.status)) return;
    setRefreshedTaskId(task.id);
    api.me().then((nextUser) => setUser(nextUser as User)).catch(() => undefined);
  }, [authReady, refreshedTaskId, task]);

  const handleFieldChange = useCallback((name: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleFilesChange = useCallback(async (name: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading((prev) => ({ ...prev, [name]: true }));
    try {
      const field = schema?.fields.find((f) => f.name === name);
      const selectedFiles = field?.type === "file" ? Array.from(files).slice(0, 1) : Array.from(files);
      const ids: number[] = [];
      const uploaded: UploadedFile[] = [];
      for (const file of selectedFiles) {
        const result = await api.uploadFile(file);
        ids.push(result.file_id);
        uploaded.push({ file_id: result.file_id, url: result.url, name: file.name });
      }
      setFileIds((prev) => ({ ...prev, [name]: ids }));
      setUploadedFiles((prev) => ({ ...prev, [name]: uploaded }));
      setFormValues((prev) => ({ ...prev, [name]: field?.type === "file" ? ids[0] : ids }));
    } catch (e) {
      setError(translateError(e, locale));
    } finally {
      setUploading((prev) => ({ ...prev, [name]: false }));
    }
  }, [schema]);

  const removeUploadedFile = useCallback((name: string, fileId: number) => {
    setUploadedFiles((prev) => {
      const next = (prev[name] || []).filter((file) => file.file_id !== fileId);
      return { ...prev, [name]: next };
    });
    setFileIds((prev) => {
      const next = (prev[name] || []).filter((id) => id !== fileId);
      const field = schema?.fields.find((f) => f.name === name);
      setFormValues((values) => ({ ...values, [name]: field?.type === "file" ? next[0] : next }));
      return { ...prev, [name]: next };
    });
  }, [schema]);

  const buildInputs = useCallback(() => {
    const inputs: Record<string, unknown> = { ...formValues };
    for (const [key, ids] of Object.entries(fileIds)) {
      const field = schema?.fields.find((f) => f.name === key);
      inputs[key] = field?.type === "file" ? ids[0] : ids;
    }
    return inputs;
  }, [fileIds, formValues, schema]);

  useEffect(() => {
    if (!authReady || !model || !schema) return;
    const timer = setTimeout(async () => {
      setPricePreviewLoading(true);
      try {
        const preview = await api.modelPricePreview(modelCode, buildInputs()) as PricePreview;
        setPricePreview(preview);
        setPricePreviewError(false);
      } catch {
        setPricePreview(undefined);
        setPricePreviewError(true);
      } finally {
        setPricePreviewLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [authReady, buildInputs, model, modelCode, schema]);

  async function submit() {
    setError("");
    setSubmitting(true);
    try {
      const inputs = buildInputs();
      const body: Record<string, unknown> = { model_code: modelCode, inputs };
      if (schema) {
        const promptField = schema.fields.find((f) => f.provider_key === "prompt" || f.name === "prompt");
        if (promptField && inputs[promptField.name]) {
          body.prompt = String(inputs[promptField.name]);
        }
      }
      const queued = await api.createGeneration(body) as { task_id: number };
      setTask(await api.task(queued.task_id) as Generation);
      setUser(await api.me() as User);
    } catch (e) { setError(translateError(e, locale)); }
    finally { setSubmitting(false); }
  }

  if (error) return <div className="space-y-3"><div className="rounded-card bg-red-50 p-4 text-red-700 shadow-soft-sm">{error}</div>{debug ? <TelegramDebugBlock debug={debug} /> : null}</div>;
  if (loadingTimedOut) return <div className="space-y-3"><div className="rounded-card bg-red-50 p-4 text-red-700 shadow-soft-sm">{t(locale, "auth.connectionError")}</div><button className="hubicx-secondary-button" onClick={() => window.location.reload()}>{t(locale, "common.retry")}</button>{showDebug ? <TelegramDebugBlock debug={getTelegramDebugState()} /> : null}</div>;
  if (!authReady || !model || !user) return <div className="space-y-3"><div className="h-32 animate-pulse rounded-card bg-white/80" /><div className="h-56 animate-pulse rounded-card bg-white/80" /></div>;

  const isProcessing = !!task && ["created", "queued", "processing"].includes(task.status);
  const promptField = schema?.fields.find((f) => f.provider_key === "prompt" || f.name === "prompt");
  const promptRequired = promptField?.required !== false;
  const promptMissing = promptRequired && !String(formValues[promptField?.name || "prompt"] || "").trim();
  const requiredFileMissing = (schema?.fields || []).some((f) => {
    if (!f.required || (f.type !== "file" && f.type !== "files")) return false;
    const value = formValues[f.name];
    if (f.type === "file") return value == null;
    return !Array.isArray(value) || value.length === 0;
  });
  const previewCost = pricePreview?.final_price_credits;
  const balanceCheckCost = previewCost ?? (schema ? undefined : model.price_credits);
  const notEnoughBalance = balanceCheckCost !== undefined && user.balance_credits < balanceCheckCost;
  const isUploading = Object.values(uploading).some(Boolean);
  const disabled = submitting || isProcessing || promptMissing || requiredFileMissing || notEnoughBalance || isUploading;
  const priceValue = pricePreview
    ? `${pricePreview.final_price_credits} 🪙`
    : schema
      ? `${locale === "ru" ? "от " : "from "}${model.price_credits} 🪙`
      : `${model.price_credits} 🪙`;

  const mainFields = (localizedSchema?.fields || []).filter((f) => !f.advanced);
  const advancedFields = (localizedSchema?.fields || []).filter((f) => f.advanced);

  return <div className="space-y-4">
    <BalanceCard balance={user.balance_credits} locale={locale} />
    <section className="relative overflow-hidden rounded-[2rem] border border-white bg-[linear-gradient(135deg,#F8FBFF_0%,#EAF4FF_55%,#D9ECFF_100%)] p-5 shadow-soft-md">
      <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-brand-primary/20 blur-3xl" />
      <p className="relative text-sm font-bold text-brand-primary">{t(locale, "generate.studio")}</p>
      <h1 className="relative mt-2 text-3xl font-black leading-tight text-ink-primary">{localizedModel?.title}</h1>
      <p className="relative mt-3 text-sm leading-6 text-ink-secondary">{localizedModel?.description}</p>
      <div className="relative mt-4 flex flex-wrap gap-2 text-xs font-bold">
        <span className="hubicx-badge">{model.provider}</span>
        <span className="hubicx-badge">{model.task_type}</span>
        <span className="hubicx-badge">{model.input_type}</span>
        {schema?.result_type ? <span className="hubicx-badge">{schema.result_type}</span> : null}
      </div>
      {localizedSchema?.helper_text ? <p className="relative mt-4 rounded-2xl bg-white/70 p-3 text-sm text-ink-secondary backdrop-blur">{localizedSchema.helper_text}</p> : null}
    </section>

    {schema ? <>
      <section className="rounded-card border border-border-soft bg-white p-5 shadow-soft-sm">
        <div className="mb-4">
          <p className="text-sm font-bold text-brand-primary">{t(locale, "generate.parameters")}</p>
          <h2 className="text-xl font-black text-ink-primary">{t(locale, "generate.whatCreate")}</h2>
        </div>
      {mainFields.map((f) => <div key={f.name} className="mb-4 space-y-2 last:mb-0">
        <DynamicField field={f} value={formValues[f.name]} locale={locale} onChange={handleFieldChange} onFilesChange={handleFilesChange} />
        {(uploadedFiles[f.name] || []).map((file) => <div key={file.file_id} className="flex items-center gap-3 rounded-2xl border border-border-soft bg-surface-soft p-2 text-sm">
          {file.url.match(/\.(png|jpe?g|webp|gif)$/i) ? <img src={file.url} alt={file.name} className="h-12 w-12 rounded-xl object-cover" /> : null}
          <span className="min-w-0 flex-1 truncate text-ink-secondary">{file.name}</span>
          <button type="button" className="rounded-xl bg-white px-3 py-1 text-xs font-bold text-brand-primary" onClick={() => removeUploadedFile(f.name, file.file_id)}>{t(locale, "upload.remove")}</button>
        </div>)}
      </div>)}
      </section>
      {uploading[Object.keys(uploading).find((k) => uploading[k]) || ""] && <p className="rounded-2xl bg-brand-soft p-3 text-sm text-brand-primary">{t(locale, "generate.uploadingFile")}</p>}
      {advancedFields.length > 0 && <>
        <button className="hubicx-secondary-button w-full" onClick={() => setShowAdvanced(!showAdvanced)}>{showAdvanced ? t(locale, "generate.hideSettings") : t(locale, "generate.advancedSettings")}</button>
        {showAdvanced && <section className="rounded-card border border-border-soft bg-white p-5 shadow-soft-sm">{advancedFields.map((f) => <div key={f.name} className="mb-4 space-y-2 last:mb-0">
          <DynamicField field={f} value={formValues[f.name]} locale={locale} onChange={handleFieldChange} onFilesChange={handleFilesChange} />
          {(uploadedFiles[f.name] || []).map((file) => <div key={file.file_id} className="flex items-center gap-3 rounded-2xl border border-border-soft bg-surface-soft p-2 text-sm">
            {file.url.match(/\.(png|jpe?g|webp|gif)$/i) ? <img src={file.url} alt={file.name} className="h-12 w-12 rounded-xl object-cover" /> : null}
            <span className="min-w-0 flex-1 truncate text-ink-secondary">{file.name}</span>
            <button type="button" className="rounded-xl bg-white px-3 py-1 text-xs font-bold text-brand-primary" onClick={() => removeUploadedFile(f.name, file.file_id)}>{t(locale, "upload.remove")}</button>
          </div>)}
        </div>)}</section>}
      </>}
    </> : <>
      <textarea className="hubicx-input min-h-36 resize-none" rows={4} placeholder={t(locale, "field.defaultPrompt")} value={String(formValues.prompt || "")} onChange={(e) => handleFieldChange("prompt", e.target.value)} />
    </>}

    <section className="rounded-card border border-border-soft bg-white p-5 shadow-soft-sm">
      <div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold text-ink-secondary">{t(locale, "generate.cost")}</span><b className="text-2xl text-ink-primary">{priceValue}</b></div>
      <p className="mt-2 text-xs text-ink-muted">{t(locale, "generate.currentBalance")}: {user.balance_credits} 🪙</p>
      {pricePreviewLoading ? <p className="mt-2 text-xs text-ink-muted">{t(locale, "generate.recalculating")}</p> : null}
      {pricePreviewError ? <p className="mt-2 text-xs text-ink-muted">{t(locale, "generate.finalCostHint")}</p> : null}
    </section>
    {notEnoughBalance ? <p className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-700">{t(locale, "generate.notEnoughCredits", { cost: balanceCheckCost || 0, balance: user.balance_credits })}</p> : null}
    {promptMissing ? <p className="rounded-2xl bg-brand-soft p-3 text-sm text-brand-primary">{t(locale, "generate.describeWhatCreate")}</p> : null}
    {requiredFileMissing ? <p className="rounded-2xl bg-brand-soft p-3 text-sm text-brand-primary">{t(locale, "generate.requiredFiles")}</p> : null}
    <button className="hubicx-primary-button w-full py-4 text-base" onClick={submit} disabled={disabled}>{submitting ? t(locale, "generate.creatingTask") : isProcessing ? t(locale, "generate.generating") : (localizedSchema?.submit_label || t(locale, "generate.generate"))}</button>
    <GenerationStatus task={task} locale={locale} onGenerateAgain={() => { setTask(undefined); setRefreshedTaskId(undefined); }} />
  </div>;
}
