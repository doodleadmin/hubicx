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
  output_file_url?: string;
  output_text?: string;
  error_message?: string;
  cost_credits: number;
  created_at: string;
  completed_at?: string;
  title?: string;
};
