export type FormFieldDef = {
  name: string;
  provider_key?: string;
  label: string;
  type: "textarea" | "text" | "select" | "number" | "switch" | "file" | "files" | "hidden";
  required?: boolean;
  default?: unknown;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  helper_text?: string;
  accept?: string;
  max_files?: number;
  advanced?: boolean;
};

export type FormSchema = {
  version?: number;
  fields: FormFieldDef[];
  submit_label?: string;
  result_type?: string;
  helper_text?: string;
  schema_source?: {
    status?: string;
    url?: string;
    checked_at?: string;
    note?: string;
  };
  price_rules?: Record<string, unknown>;
};

export type User = {
  id: number;
  telegram_id: number;
  username?: string;
  first_name?: string;
  language_code: string;
  balance_credits: number;
  ref_code: string;
};

export type AIModel = {
  id: number;
  code: string;
  title: string;
  description?: string;
  category: "photo" | "video" | "text";
  provider: string;
  task_type: "text" | "image" | "video" | "audio";
  input_type: string;
  price_credits: number;
  default_params?: Record<string, unknown>;
  form_schema?: FormSchema | null;
};

export type Template = {
  id: number;
  code: string;
  title: string;
  description?: string;
  template_type: string;
  required_inputs: { fields?: string[] };
  default_params: Record<string, unknown>;
  price_credits: number;
};

export type Generation = {
  id: number;
  status: string;
  task_type: string;
  prompt?: string;
  input_file_url?: string;
  output_file_url?: string;
  output_text?: string;
  error_message?: string;
  cost_credits: number;
  created_at: string;
  completed_at?: string;
  title?: string;
  model_code?: string;
  template_code?: string;
};

export type PricePreview = {
  model_code: string;
  base_price_credits: number;
  final_price_credits: number;
  currency: "credits";
  breakdown: Record<string, unknown>[];
};
