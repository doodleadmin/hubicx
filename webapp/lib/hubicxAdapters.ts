import type { AIModel, FormFieldDef, Generation, User } from "./types";

export type UiModelCard = {
  code: string;
  title: string;
  description: string;
  taskType: string;
  price: number;
};

export type UiHistoryCard = {
  id: number;
  title: string;
  status: string;
  taskType: string;
  cost: number;
  prompt: string;
  resultUrl?: string;
};

export type UiBalanceView = {
  credits: number;
  languageCode: string;
};

export type UiField = FormFieldDef & {
  label: string;
  visible: boolean;
};

export function mapApiModelToUiCard(model: AIModel): UiModelCard {
  return {
    code: model.code,
    title: model.title || model.code,
    description: model.description || "",
    taskType: model.task_type,
    price: model.price_credits,
  };
}

export function mapApiTaskToHistoryCard(task: Generation): UiHistoryCard {
  return {
    id: task.id,
    title: task.title || task.model_code || task.task_type,
    status: task.status,
    taskType: task.task_type,
    cost: task.cost_credits || 0,
    prompt: task.prompt || "",
    resultUrl: task.output_file_url || undefined,
  };
}

export function mapApiBalanceToBalanceView(user: User): UiBalanceView {
  return {
    credits: user.balance_credits || 0,
    languageCode: user.language_code || "ru",
  };
}

export function mapFormSchemaToUiFields(fields: FormFieldDef[] = []): UiField[] {
  return fields.map((field) => ({
    ...field,
    label: field.label || field.name,
    visible: field.type !== "hidden" && !field.advanced,
  }));
}
