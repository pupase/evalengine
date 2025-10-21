export type ModelProvider = 'anthropic' | 'openai' | 'google';

export interface PromptConfig {
  systemPrompt?: string;
  promptA: string;
  promptB: string;
  model: ModelProvider;
}

export interface InputRow {
  id: string;
  data: string;
  metadata?: Record<string, any>;
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
