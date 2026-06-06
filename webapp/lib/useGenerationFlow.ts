"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import { getLocale, localizeField, localizeModel, type Locale, translateError } from "./i18n";
import { getTelegramLanguageCode, initTelegram } from "./telegram";
import type { AIModel, FormSchema, Generation, PricePreview, User } from "./types";

export type UploadedFile = { file_id: number; url: string; name: string };

function getDefaults(schema: FormSchema): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  for (const field of schema.fields) {
    if (field.default !== undefined) defaults[field.name] = field.default;
  }
  return defaults;
}

export function useGenerationFlow(modelCode: string) {
  const [model, setModel] = useState<AIModel>();
  const [user, setUser] = useState<User>();
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [fileIds, setFileIds] = useState<Record<string, number[]>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile[]>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [task, setTask] = useState<Generation>();
  const [error, setError] = useState("");
  const [authReady, setAuthReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshedTaskId, setRefreshedTaskId] = useState<number>();
  const [pricePreview, setPricePreview] = useState<PricePreview>();
  const [pricePreviewLoading, setPricePreviewLoading] = useState(false);
  const [pricePreviewError, setPricePreviewError] = useState(false);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const [locale, setLocale] = useState<Locale>("ru");

  const schema = model?.form_schema || undefined;
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
          setLocale(getLocale(undefined, getTelegramLanguageCode()));
          setError("Откройте WebApp через Telegram-бота");
          return;
        }
        setAuthReady(true);
        const [nextModel, nextUser] = await Promise.all([api.model(modelCode), api.me()]);
        if (cancelled) return;
        const typedModel = nextModel as AIModel;
        const typedUser = nextUser as User;
        setLocale(getLocale(typedUser.language_code, getTelegramLanguageCode()));
        setModel(typedModel);
        setUser(typedUser);
        if (typedModel.form_schema) setFormValues(getDefaults(typedModel.form_schema));
      } catch (event) {
        if (!cancelled) setError(translateError(event, getLocale(undefined, getTelegramLanguageCode())));
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [modelCode]);

  useEffect(() => {
    if (error || (authReady && model && user)) return;
    const timer = window.setTimeout(() => setLoadingTimedOut(true), 5000);
    return () => window.clearTimeout(timer);
  }, [authReady, error, model, user]);

  useEffect(() => {
    if (!authReady || !task || !["queued", "processing", "created"].includes(task.status)) return;
    const timer = window.setInterval(() => api.task(task.id).then((next) => setTask(next as Generation)).catch(() => undefined), 2500);
    return () => window.clearInterval(timer);
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
      const field = schema?.fields.find((item) => item.name === name);
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
    } catch (event) {
      setError(translateError(event, locale));
    } finally {
      setUploading((prev) => ({ ...prev, [name]: false }));
    }
  }, [locale, schema]);

  const removeUploadedFile = useCallback((name: string, fileId: number) => {
    setUploadedFiles((prev) => ({ ...prev, [name]: (prev[name] || []).filter((file) => file.file_id !== fileId) }));
    setFileIds((prev) => {
      const next = (prev[name] || []).filter((id) => id !== fileId);
      const field = schema?.fields.find((item) => item.name === name);
      setFormValues((values) => ({ ...values, [name]: field?.type === "file" ? next[0] : next }));
      return { ...prev, [name]: next };
    });
  }, [schema]);

  const buildInputs = useCallback(() => {
    const inputs: Record<string, unknown> = { ...formValues };
    for (const [key, ids] of Object.entries(fileIds)) {
      const field = schema?.fields.find((item) => item.name === key);
      inputs[key] = field?.type === "file" ? ids[0] : ids;
    }
    return inputs;
  }, [fileIds, formValues, schema]);

  useEffect(() => {
    if (!authReady || !model || !schema) return;
    const timer = window.setTimeout(async () => {
      setPricePreviewLoading(true);
      try {
        setPricePreview(await api.modelPricePreview(modelCode, buildInputs()) as PricePreview);
        setPricePreviewError(false);
      } catch {
        setPricePreview(undefined);
        setPricePreviewError(true);
      } finally {
        setPricePreviewLoading(false);
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [authReady, buildInputs, model, modelCode, schema]);

  async function submit() {
    setError("");
    setSubmitting(true);
    try {
      const inputs = buildInputs();
      const body: Record<string, unknown> = { model_code: modelCode, inputs };
      const promptField = schema?.fields.find((field) => field.provider_key === "prompt" || field.name === "prompt");
      if (promptField && inputs[promptField.name]) body.prompt = String(inputs[promptField.name]);
      const queued = await api.createGeneration(body) as { task_id: number };
      setTask(await api.task(queued.task_id) as Generation);
      setUser(await api.me() as User);
    } catch (event) {
      setError(translateError(event, locale));
    } finally {
      setSubmitting(false);
    }
  }

  const isProcessing = !!task && ["created", "queued", "processing"].includes(task.status);
  const promptField = schema?.fields.find((field) => field.provider_key === "prompt" || field.name === "prompt");
  const promptRequired = promptField?.required !== false;
  const promptMissing = promptRequired && !String(formValues[promptField?.name || "prompt"] || "").trim();
  const requiredFileMissing = (schema?.fields || []).some((field) => {
    if (!field.required || (field.type !== "file" && field.type !== "files")) return false;
    const value = formValues[field.name];
    return field.type === "file" ? value == null : !Array.isArray(value) || value.length === 0;
  });
  const previewCost = pricePreview?.final_price_credits;
  const balanceCheckCost = previewCost ?? model?.price_credits;
  const notEnoughBalance = user && balanceCheckCost !== undefined && user.balance_credits < balanceCheckCost;
  const isUploading = Object.values(uploading).some(Boolean);
  const disabled = submitting || isProcessing || promptMissing || requiredFileMissing || Boolean(notEnoughBalance) || isUploading;

  return {
    authReady,
    balanceCheckCost,
    buildInputs,
    disabled,
    error,
    formValues,
    handleFieldChange,
    handleFilesChange,
    isProcessing,
    isUploading,
    loadingTimedOut,
    locale,
    localizedModel,
    localizedSchema,
    model,
    notEnoughBalance,
    pricePreview,
    pricePreviewError,
    pricePreviewLoading,
    promptMissing,
    removeUploadedFile,
    requiredFileMissing,
    setTask,
    submit,
    submitting,
    task,
    uploadedFiles,
    uploading,
    user,
  };
}
