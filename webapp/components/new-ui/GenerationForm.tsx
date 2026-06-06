"use client";

import { api } from "@/lib/api";
import { useGenerationFlow } from "@/lib/useGenerationFlow";
import type { FormFieldDef, Generation } from "@/lib/types";
import { IC, tt } from "./prototypeData";
import { FieldLabel, PillGroup, PlaceholderSlot, Token } from "./shared";

function optionValue(option: string | number | { label?: string; value: string | number }) {
  return typeof option === "object" ? option.value : option;
}

function optionLabel(option: string | number | { label?: string; value: string | number }) {
  return typeof option === "object" ? option.label || String(option.value) : String(option);
}

function DynamicField({ field, value, lang, onChange, onFilesChange, uploading }: {
  field: FormFieldDef;
  value: unknown;
  lang: string;
  onChange: (name: string, value: unknown) => void;
  onFilesChange: (name: string, files: FileList | null) => void;
  uploading?: boolean;
}) {
  if (field.type === "hidden" || field.advanced) return null;
  const label = field.label + (field.required ? " *" : "");
  if (field.type === "textarea") {
    return <div><FieldLabel hint={String(value || "").length ? `${String(value || "").length}/500` : ""}>{label}</FieldLabel><div className="card" style={{ padding: 14, boxShadow: "var(--sh-sm)" }}><textarea value={String(value || "")} onChange={(event) => onChange(field.name, event.target.value)} maxLength={500} rows={4} placeholder={field.placeholder || tt(lang, "Describe what to create", "Опишите, что создать")} style={{ width: "100%", border: "none", outline: "none", resize: "none", fontSize: 15, lineHeight: 1.5, color: "var(--text)", background: "transparent" }} /></div>{field.helper_text ? <p className="muted" style={{ marginTop: 6, fontSize: 12 }}>{field.helper_text}</p> : null}</div>;
  }
  if (field.type === "select") {
    const options = field.options || [];
    return <div><FieldLabel>{label}</FieldLabel><PillGroup value={(value ?? field.default ?? optionValue(options[0] || "")) as string | number} onChange={(next) => onChange(field.name, next)} options={options.map((item) => ({ v: optionValue(item), l: optionLabel(item) }))} col /></div>;
  }
  if (field.type === "switch") {
    return <div><FieldLabel>{label}</FieldLabel><button className="card" onClick={() => onChange(field.name, !Boolean(value))} style={{ padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}><span style={{ fontWeight: 800, color: "var(--text)", fontSize: 14 }}>{field.helper_text || field.label}</span><span style={{ width: 48, height: 28, borderRadius: 99, padding: 3, background: value ? "var(--grad)" : "var(--surface-blue)", transition: ".2s" }}><span style={{ display: "block", width: 22, height: 22, borderRadius: 99, background: "#fff", transform: value ? "translateX(20px)" : "translateX(0)", transition: ".2s", boxShadow: "var(--sh-sm)" }} /></span></button></div>;
  }
  if (field.type === "file" || field.type === "files") {
    return <div><FieldLabel hint={field.required ? tt(lang, "required", "обязательно") : tt(lang, "optional", "необязательно")}>{label}</FieldLabel><label style={{ display: "block", cursor: "pointer" }}><PlaceholderSlot id={`upload-${field.name}`} placeholder={uploading ? tt(lang, "Uploading...", "Загрузка...") : field.type === "files" ? tt(lang, "Upload images", "Загрузите изображения") : tt(lang, "Upload image", "Загрузите изображение")} /><input type="file" accept={field.accept} multiple={field.type === "files"} style={{ display: "none" }} onChange={(event) => onFilesChange(field.name, event.target.files)} /></label>{field.helper_text ? <p className="muted" style={{ marginTop: 6, fontSize: 12 }}>{field.helper_text}</p> : null}</div>;
  }
  if (field.type === "number") {
    return <div><FieldLabel>{label}</FieldLabel><input className="card" type="number" min={field.min} max={field.max} step={field.step || 1} value={value != null ? String(value) : ""} placeholder={String(field.default ?? "")} onChange={(event) => onChange(field.name, event.target.value === "" ? field.default : Number(event.target.value))} style={{ width: "100%", height: 52, padding: "0 14px", border: "1px solid var(--border)", outline: "none", fontSize: 15, fontWeight: 700 }} /></div>;
  }
  return <div><FieldLabel>{label}</FieldLabel><input className="card" type="text" value={String(value || "")} placeholder={field.placeholder} onChange={(event) => onChange(field.name, event.target.value)} style={{ width: "100%", height: 52, padding: "0 14px", border: "1px solid var(--border)", outline: "none", fontSize: 15, fontWeight: 700 }} /></div>;
}

function ResultActions({ task, lang }: { task: Generation; lang: string }) {
  const fileUrl = task.output_file_url;
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 12 }}>
    <a className="btn-white" href={fileUrl || "#"} target="_blank" rel="noreferrer" style={{ height: 64, borderRadius: 16, display: "flex", flexDirection: "column", gap: 4, fontSize: 11, fontWeight: 700, color: "var(--text-2)", padding: 0, alignItems: "center", justifyContent: "center", pointerEvents: fileUrl ? undefined : "none", opacity: fileUrl ? 1 : .5 }}><img src={IC("document")} alt="" style={{ width: 26, height: 26 }} />{tt(lang, "Open", "Открыть")}</a>
    <button className="btn-white" onClick={() => api.sendToChat(task.id).catch(() => undefined)} style={{ height: 64, borderRadius: 16, display: "flex", flexDirection: "column", gap: 4, fontSize: 11, fontWeight: 700, color: "var(--text-2)", padding: 0 }}><img src={IC("send")} alt="" style={{ width: 26, height: 26 }} />{tt(lang, "Telegram", "В Telegram")}</button>
    <button className="btn-white" onClick={() => window.location.reload()} style={{ height: 64, borderRadius: 16, display: "flex", flexDirection: "column", gap: 4, fontSize: 11, fontWeight: 700, color: "var(--text-2)", padding: 0 }}><img src={IC("warning")} alt="" style={{ width: 26, height: 26 }} />{tt(lang, "Repeat", "Повтор")}</button>
    <button className="btn-white" onClick={() => task.prompt && navigator.clipboard?.writeText(task.prompt)} style={{ height: 64, borderRadius: 16, display: "flex", flexDirection: "column", gap: 4, fontSize: 11, fontWeight: 700, color: "var(--text-2)", padding: 0 }}><img src={IC("link")} alt="" style={{ width: 26, height: 26 }} />{tt(lang, "Copy", "Промпт")}</button>
  </div>;
}

export default function GenerationForm({ modelCode }: { modelCode: string }) {
  const flow = useGenerationFlow(modelCode);
  const lang = flow.locale;
  const fields = flow.localizedSchema?.fields.filter((field) => !field.advanced && field.type !== "hidden") || [];
  const cost = flow.pricePreview?.final_price_credits ?? flow.model?.price_credits ?? 0;
  const balance = flow.user?.balance_credits ?? 0;

  if (flow.error) return <div className="phone"><div className="scroll"><div className="page"><div className="card" style={{ padding: 18, color: "var(--danger)", fontWeight: 800 }}>{flow.error}</div></div></div></div>;
  if (flow.loadingTimedOut) return <div className="phone"><div className="scroll"><div className="page"><div className="card" style={{ padding: 18, color: "var(--danger)", fontWeight: 800 }}>{tt(lang, "Connection timed out", "Не удалось подключиться")}</div><button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => window.location.reload()}>{tt(lang, "Retry", "Повторить")}</button></div></div></div>;
  if (!flow.authReady || !flow.model || !flow.user) return <div className="phone"><div className="scroll"><div className="page"><div className="card" style={{ height: 160, padding: 18 }}>{tt(lang, "Loading studio...", "Загружаем студию...")}</div></div></div></div>;

  return <div className="phone"><div className="scroll"><div className="page"><div className="row" style={{ justifyContent: "space-between", marginBottom: 2 }}><button className="backbtn" onClick={() => history.back()}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>{tt(lang, "Back", "Назад")}</button><button className="balpill"><img src={IC("coins")} alt="" /><span className="lbl">{balance.toLocaleString()}</span></button></div><h1 className="ptitle" style={{ marginTop: 8 }}>{flow.localizedModel?.title}</h1><p className="psub">{flow.localizedModel?.description}</p><div style={{ display: "flex", flexDirection: "column", gap: 15 }}>{fields.map((field) => <div key={field.name}><DynamicField field={field} value={flow.formValues[field.name]} lang={lang} onChange={flow.handleFieldChange} onFilesChange={flow.handleFilesChange} uploading={flow.uploading[field.name]} />{(flow.uploadedFiles[field.name] || []).map((file) => <div key={file.file_id} className="card" style={{ marginTop: 8, padding: 8, display: "flex", alignItems: "center", gap: 10 }}><img src={file.url} alt="" style={{ width: 46, height: 46, borderRadius: 12, objectFit: "cover" }} /><span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12, fontWeight: 700, color: "var(--text-2)" }}>{file.name}</span><button className="chip" onClick={() => flow.removeUploadedFile(field.name, file.file_id)}>{tt(lang, "Remove", "Удалить")}</button></div>)}</div>)}</div><div className="card" style={{ padding: 16, marginTop: 20, background: "var(--surface-blue)", border: "1px solid #DCEBFF" }}><div className="row" style={{ justifyContent: "space-between" }}><span className="t2" style={{ fontWeight: 700, fontSize: 13.5 }}>{tt(lang, "Estimated cost", "Примерная стоимость")}</span><span style={{ fontSize: 19, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}><Token size={20} />{flow.pricePreviewLoading ? "..." : cost}</span></div><div className="row" style={{ justifyContent: "space-between", marginTop: 8 }}><span className="muted" style={{ fontSize: 12, fontWeight: 700 }}>{tt(lang, "Balance after", "Останется")}</span><span style={{ fontSize: 13, fontWeight: 800, color: flow.notEnoughBalance ? "var(--danger)" : "var(--text-2)" }}>{flow.notEnoughBalance ? tt(lang, "Not enough credits", "Недостаточно кредитов") : (balance - cost).toLocaleString()}</span></div>{flow.pricePreviewError ? <p className="muted" style={{ marginTop: 8, fontSize: 12 }}>{tt(lang, "Final price will be calculated on submit.", "Итоговая цена рассчитается при запуске.")}</p> : null}</div>{flow.promptMissing ? <p className="card" style={{ padding: 12, color: "var(--blue)", fontWeight: 800 }}>{tt(lang, "Add a prompt to continue", "Добавьте промпт")}</p> : null}{flow.requiredFileMissing ? <p className="card" style={{ padding: 12, color: "var(--blue)", fontWeight: 800 }}>{tt(lang, "Upload required files", "Загрузите обязательные файлы")}</p> : null}<button className="btn btn-primary" style={{ marginTop: 14 }} disabled={flow.disabled} onClick={flow.submit}><img src={IC("swirl")} alt="" style={{ width: 24, height: 24 }} />{flow.submitting ? tt(lang, "Creating task...", "Создаём задачу...") : flow.isProcessing ? tt(lang, "Generating...", "Генерация...") : flow.localizedSchema?.submit_label || tt(lang, "Generate", "Сгенерировать")}</button>{flow.task ? <div className="card fu" style={{ padding: 14, marginTop: 18 }}><div className="row" style={{ justifyContent: "space-between", marginBottom: 12, padding: "0 2px" }}><div className="row" style={{ gap: 8 }}><img src={flow.task.status === "completed" ? IC("check") : IC("swirl")} alt="" style={{ width: 24, height: 24 }} /><b style={{ fontSize: 15 }}>{flow.task.status}</b></div><span className="muted" style={{ fontSize: 12, fontWeight: 700 }}>#{flow.task.id}</span></div>{flow.task.output_file_url ? <div style={{ borderRadius: 16, overflow: "hidden", background: "var(--surface-blue)" }}><img src={flow.task.output_file_url} alt="" style={{ width: "100%", display: "block" }} /></div> : flow.task.output_text ? <div className="card" style={{ padding: 14, background: "var(--surface-soft)", boxShadow: "none", whiteSpace: "pre-wrap" }}>{flow.task.output_text}</div> : <div className="muted" style={{ fontWeight: 700 }}>{tt(lang, "Waiting for result...", "Ждём результат...")}</div>}<ResultActions task={flow.task} lang={lang} /></div> : null}</div></div></div>;
}
