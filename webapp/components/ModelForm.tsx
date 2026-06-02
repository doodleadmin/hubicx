"use client";

import { useEffect, useState, useCallback } from "react";
import BalanceCard from "./BalanceCard";
import GenerationStatus from "./GenerationStatus";
import { api } from "@/lib/api";
import { getTelegramDebugState, initTelegram, TelegramDebugState } from "@/lib/telegram";
import { AIModel, FormFieldDef, FormSchema, Generation, PricePreview, User } from "@/lib/types";

const showDebug = process.env.NEXT_PUBLIC_DEBUG === "true";

type UploadedFile = { file_id: number; url: string; name: string };

function TelegramDebugBlock({ debug }: { debug: TelegramDebugState }) {
  return <div className="rounded-2xl border border-white/10 bg-card p-3 text-xs text-muted">
    <p className="font-semibold text-white">Debug</p>
    <p>hasWindowTelegram: {String(debug.hasWindowTelegram)}</p>
    <p>hasTelegramWebApp: {String(debug.hasTelegramWebApp)}</p>
    <p>initDataLength: {debug.initDataLength}</p>
    <p>initDataUnsafeUserId: {debug.initDataUnsafeUserId}</p>
    <p>backendUrl: {debug.backendUrl}</p>
    <p className="break-all">currentUrl: {debug.currentUrl}</p>
  </div>;
}

function DynamicField({ field, value, onChange, onFilesChange }: {
  field: FormFieldDef;
  value: unknown;
  onChange: (name: string, value: unknown) => void;
  onFilesChange?: (name: string, files: FileList | null) => void;
}) {
  const { name, label, type, required, placeholder, helper_text, options, min, max, step, accept } = field;

  if (type === "hidden") return null;

  const fieldId = `field-${name}`;

  return <div className="space-y-1">
    <label htmlFor={fieldId} className="text-sm font-medium text-white">{label}{required ? " *" : ""}</label>
    {type === "textarea" && <textarea id={fieldId} className="w-full rounded-2xl bg-white/5 p-3 text-white placeholder:text-muted resize-none" rows={3} placeholder={placeholder} value={String(value || "")} onChange={(e) => onChange(name, e.target.value)} />}
    {type === "text" && <input id={fieldId} type="text" className="w-full rounded-2xl bg-white/5 p-3 text-white placeholder:text-muted" placeholder={placeholder} value={String(value || "")} onChange={(e) => onChange(name, e.target.value)} />}
    {type === "select" && <select id={fieldId} className="w-full rounded-2xl bg-white/5 p-3 text-white" value={String(value || field.default || "")} onChange={(e) => onChange(name, e.target.value)}>{(options || []).map((o) => <option key={o} value={o}>{o}</option>)}</select>}
    {type === "number" && <input id={fieldId} type="number" className="w-full rounded-2xl bg-white/5 p-3 text-white" min={min} max={max} step={step || 1} value={value != null ? String(value) : ""} placeholder={String(field.default ?? "")} onChange={(e) => onChange(name, e.target.value === "" ? field.default : Number(e.target.value))} />}
    {type === "switch" && <label className="flex items-center gap-3 cursor-pointer"><input id={fieldId} type="checkbox" className="w-5 h-5 rounded accent-white" checked={Boolean(value)} onChange={(e) => onChange(name, e.target.checked)} /><span className="text-sm text-muted">{label}</span></label>}
    {type === "file" && <input id={fieldId} type="file" accept={accept} className="w-full rounded-2xl bg-white/5 p-3 text-white text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-white" onChange={(e) => onFilesChange?.(name, e.target.files)} />}
    {type === "files" && <input id={fieldId} type="file" accept={accept} multiple className="w-full rounded-2xl bg-white/5 p-3 text-white text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-white" onChange={(e) => onFilesChange?.(name, e.target.files)} />}
    {helper_text && type !== "switch" && <p className="text-xs text-muted">{helper_text}</p>}
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

  const schema = model?.form_schema as FormSchema | undefined;

  useEffect(() => {
    let cancelled = false;
    setLoadingTimedOut(false);
    async function load() {
      try {
        const auth = await initTelegram();
        if (cancelled) return;
        if (!auth.hasTelegramWebApp || !auth.initData) {
          if (showDebug) setDebug(getTelegramDebugState());
          setError("Откройте WebApp через Telegram-бота");
          return;
        }
        setAuthReady(true);
        const [m, u] = await Promise.all([api.model(modelCode), api.me()]);
        if (!cancelled) {
          setModel(m as AIModel);
          setUser(u as User);
          const ms = (m as AIModel).form_schema;
          if (ms) setFormValues(getDefaults(ms));
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Не удалось загрузить модель");
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
      const ids: number[] = [];
      const uploaded: UploadedFile[] = [];
      for (let i = 0; i < files.length; i++) {
        const result = await api.uploadFile(files[i]);
        ids.push(result.file_id);
        uploaded.push({ file_id: result.file_id, url: result.url, name: files[i].name });
      }
      setFileIds((prev) => ({ ...prev, [name]: ids }));
      setUploadedFiles((prev) => ({ ...prev, [name]: uploaded }));
      setFormValues((prev) => ({ ...prev, [name]: ids }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки файла");
    } finally {
      setUploading((prev) => ({ ...prev, [name]: false }));
    }
  }, []);

  const removeUploadedFile = useCallback((name: string, fileId: number) => {
    setUploadedFiles((prev) => {
      const next = (prev[name] || []).filter((file) => file.file_id !== fileId);
      return { ...prev, [name]: next };
    });
    setFileIds((prev) => {
      const next = (prev[name] || []).filter((id) => id !== fileId);
      setFormValues((values) => ({ ...values, [name]: next }));
      return { ...prev, [name]: next };
    });
  }, []);

  const buildInputs = useCallback(() => {
    const inputs: Record<string, unknown> = { ...formValues };
    for (const [key, ids] of Object.entries(fileIds)) {
      inputs[key] = ids;
    }
    return inputs;
  }, [fileIds, formValues]);

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
    } catch (e) { setError(e instanceof Error ? e.message : "Не удалось создать задачу"); }
    finally { setSubmitting(false); }
  }

  if (error) return <div className="space-y-3"><div className="rounded-3xl bg-red-500/15 p-4 text-red-200">{error}</div>{debug ? <TelegramDebugBlock debug={debug} /> : null}</div>;
  if (loadingTimedOut) return <div className="space-y-3"><div className="rounded-3xl bg-red-500/15 p-4 text-red-200">Не удалось подключиться к WebApp. Откройте его через Telegram-бота или попробуйте ещё раз.</div><button className="rounded-2xl bg-card px-4 py-3 text-sm" onClick={() => window.location.reload()}>Повторить</button>{showDebug ? <TelegramDebugBlock debug={getTelegramDebugState()} /> : null}</div>;
  if (!authReady || !model || !user) return <p className="text-muted">Подключаем Telegram WebApp...</p>;

  const isProcessing = !!task && ["created", "queued", "processing"].includes(task.status);
  const promptField = schema?.fields.find((f) => f.provider_key === "prompt" || f.name === "prompt");
  const promptRequired = promptField?.required !== false;
  const promptMissing = promptRequired && !String(formValues[promptField?.name || "prompt"] || "").trim();
  const previewCost = pricePreview?.final_price_credits;
  const balanceCheckCost = previewCost ?? (schema ? undefined : model.price_credits);
  const notEnoughBalance = balanceCheckCost !== undefined && user.balance_credits < balanceCheckCost;
  const isUploading = Object.values(uploading).some(Boolean);
  const disabled = submitting || isProcessing || promptMissing || notEnoughBalance || isUploading;
  const priceText = pricePreview
    ? `Стоимость: ${pricePreview.final_price_credits} 🪙`
    : schema
      ? `Стоимость: от ${model.price_credits} 🪙`
      : `Стоимость: ${model.price_credits} 🪙`;

  const mainFields = (schema?.fields || []).filter((f) => !f.advanced);
  const advancedFields = (schema?.fields || []).filter((f) => f.advanced);

  return <div className="space-y-4">
    <BalanceCard balance={user.balance_credits} />
    <section className="rounded-3xl border border-white/10 bg-card p-4">
      <h1 className="text-2xl font-bold">{model.title}</h1>
      <p className="mt-2 text-muted">{model.description}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
        <span className="rounded-full bg-white/5 px-3 py-1">{model.provider}</span>
        <span className="rounded-full bg-white/5 px-3 py-1">{model.task_type}</span>
        <span className="rounded-full bg-white/5 px-3 py-1">input: {model.input_type}</span>
        {schema?.result_type ? <span className="rounded-full bg-white/5 px-3 py-1">result: {schema.result_type}</span> : null}
      </div>
      {schema?.helper_text ? <p className="mt-3 text-sm text-muted">{schema.helper_text}</p> : null}
      <p className="mt-3 font-semibold">{priceText}</p>
      {pricePreviewLoading ? <p className="mt-1 text-xs text-muted">Пересчитываем стоимость...</p> : null}
      {pricePreviewError ? <p className="mt-1 text-xs text-muted">Финальная стоимость будет рассчитана при запуске</p> : null}
    </section>

    {schema ? <>
      {mainFields.map((f) => <div key={f.name} className="space-y-2">
        <DynamicField field={f} value={formValues[f.name]} onChange={handleFieldChange} onFilesChange={handleFilesChange} />
        {(uploadedFiles[f.name] || []).map((file) => <div key={file.file_id} className="flex items-center gap-3 rounded-2xl bg-white/5 p-2 text-sm">
          {file.url.match(/\.(png|jpe?g|webp|gif)$/i) ? <img src={file.url} alt={file.name} className="h-12 w-12 rounded-xl object-cover" /> : null}
          <span className="min-w-0 flex-1 truncate text-muted">{file.name}</span>
          <button type="button" className="rounded-xl bg-white/10 px-3 py-1 text-xs" onClick={() => removeUploadedFile(f.name, file.file_id)}>Удалить</button>
        </div>)}
      </div>)}
      {uploading[Object.keys(uploading).find((k) => uploading[k]) || ""] && <p className="text-sm text-muted">Загрузка файлов...</p>}
      {advancedFields.length > 0 && <>
        <button className="text-sm text-muted underline" onClick={() => setShowAdvanced(!showAdvanced)}>{showAdvanced ? "Скрыть настройки" : "Дополнительные настройки"}</button>
        {showAdvanced && advancedFields.map((f) => <div key={f.name} className="space-y-2">
          <DynamicField field={f} value={formValues[f.name]} onChange={handleFieldChange} onFilesChange={handleFilesChange} />
          {(uploadedFiles[f.name] || []).map((file) => <div key={file.file_id} className="flex items-center gap-3 rounded-2xl bg-white/5 p-2 text-sm">
            {file.url.match(/\.(png|jpe?g|webp|gif)$/i) ? <img src={file.url} alt={file.name} className="h-12 w-12 rounded-xl object-cover" /> : null}
            <span className="min-w-0 flex-1 truncate text-muted">{file.name}</span>
            <button type="button" className="rounded-xl bg-white/10 px-3 py-1 text-xs" onClick={() => removeUploadedFile(f.name, file.file_id)}>Удалить</button>
          </div>)}
        </div>)}
      </>}
    </> : <>
      <textarea className="w-full rounded-2xl bg-white/5 p-3 text-white placeholder:text-muted resize-none" rows={3} placeholder="Введите промт" value={String(formValues.prompt || "")} onChange={(e) => handleFieldChange("prompt", e.target.value)} />
    </>}

    {notEnoughBalance ? <p className="rounded-2xl bg-red-500/10 p-3 text-sm text-red-200">Недостаточно кредитов: нужно {balanceCheckCost}, у вас {user.balance_credits}</p> : null}
    {promptMissing ? <p className="rounded-2xl bg-white/5 p-3 text-sm text-muted">Введите промт для генерации</p> : null}
    <button className="w-full rounded-3xl bg-accent py-4 font-bold text-black disabled:opacity-50" onClick={submit} disabled={disabled}>{submitting ? "Создаём задачу..." : isProcessing ? "Генерация..." : (schema?.submit_label || "Сгенерировать")}</button>
    <GenerationStatus task={task} onGenerateAgain={() => { setTask(undefined); setRefreshedTaskId(undefined); }} />
  </div>;
}
