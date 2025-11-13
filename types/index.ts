export type ModelProvider = 'anthropic' | 'openai';

// Specific models for each provider
export type AnthropicModel =
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-5-haiku-20241022'
  | 'claude-3-opus-20240229'
  | 'claude-3-sonnet-20240229'
  | 'claude-3-haiku-20240307';

export type OpenAIModel =
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-4-turbo'
  | 'gpt-4'
  | 'gpt-3.5-turbo';

export type ModelName = AnthropicModel | OpenAIModel;

export interface ModelInfo {
  provider: ModelProvider;
  model: ModelName;
}

export interface PromptConfig {
  systemPrompt?: string;
  promptA: string;
  promptB: string;
  provider: ModelProvider;
  model: ModelName;
}

export interface InputRow {
  id: string;
  data: string;
  metadata?: Record<string, string>;
  filename?: string;
}

export interface ComparisonResult {
  inputId: string;
  input: string;
  promptAOutput: string;
  promptBOutput: string;
  promptAError?: string;
  promptBError?: string;
  timestamp: string;
}

export interface ExportData {
  config: PromptConfig;
  results: ComparisonResult[];
  exportedAt: string;
}

// Model options for UI
export const ANTHROPIC_MODELS: { value: AnthropicModel; label: string }[] = [
  { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Latest)' },
  { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
  { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
  { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
  { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' },
];

export const OPENAI_MODELS: { value: OpenAIModel; label: string }[] = [
  { value: 'gpt-4o', label: 'GPT-4o (Latest)' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
];
