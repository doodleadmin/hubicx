export type FormFieldDef = {
  name: string;
  provider_key?: string;
  label: string;
  label_key?: string;
  type: "textarea" | "text" | "select" | "number" | "switch" | "file" | "files" | "hidden";
  required?: boolean;
  default?: unknown;
  options?: Array<string | number | { label?: string; value: string | number }>;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  helper_text?: string;
  accept?: string;
  max_files?: number;
  min_files?: number;
  maps_to?: string;
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
  is_admin: boolean;
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

export type AdminUser = {
  id: number;
  telegram_id: number;
  username?: string;
  first_name?: string;
  language_code?: string;
  balance_credits: number;
  is_admin: boolean;
  ref_code: string;
  created_at?: string;
  last_active_at?: string | null;
};

export type AdminTask = {
  id: number;
  user_id: number;
  model_id?: number;
  model_code?: string;
  model_title?: string;
  telegram_id?: number;
  username?: string;
  task_type: string;
  status: string;
  prompt?: string;
  cost_credits: number;
  error_message?: string;
  output_file_url?: string;
  created_at?: string;
  completed_at?: string;
};

export type AdminModelPricing = {
  id: number;
  model_code: string;
  display_name: string;
  category: "image" | "video" | "text";
  price_tokens: number;
  is_enabled: boolean;
  is_featured: boolean;
  admin_note?: string;
};

export type TokenPackage = {
  id: number;
  code: string;
  title: string;
  tokens: number;
  price_rub: number;
  bonus_tokens: number;
  is_active: boolean;
  sort_order: number;
};

export type BalanceLedgerItem = {
  id: number;
  user_id: number;
  amount: number;
  balance_before: number;
  balance_after: number;
  operation_type: string;
  reason?: string;
  task_id?: number;
  payment_id?: number;
  admin_user_id?: number;
  created_at?: string;
};

export type AdminTransaction = {
  id: number;
  user_id: number;
  type: string;
  amount_credits: number;
  status: string;
  generation_task_id?: number;
  payment_id?: number;
  comment?: string;
  created_at?: string;
};

export type AdminFile = {
  id: number;
  user_id: number;
  file_type: string;
  purpose: string;
  storage_url: string;
  mime_type?: string;
  size_bytes?: number;
  created_at?: string;
};

export type AdminModelItem = {
  id: number;
  code: string;
  title: string;
  category: string;
  provider: string;
  task_type: string;
  price_credits: number;
  is_active: boolean;
  form_schema?: Record<string, unknown> | null;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};
