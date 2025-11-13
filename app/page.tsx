'use client';

import { useState } from 'react';
import {
  ModelProvider,
  ModelName,
  PromptConfig,
  InputRow,
  ComparisonResult,
  ANTHROPIC_MODELS,
  OPENAI_MODELS,
} from '@/types';
import ResultsView from '@/components/ResultsView';

export default function Home() {
  const [config, setConfig] = useState<PromptConfig>({
    systemPrompt: '',
    promptA: '',
    promptB: '',
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
  });

  const [inputs, setInputs] = useState<InputRow[]>([]);
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    const formData = new FormData();

    // Add all selected PDF files
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse PDF');
      }

      setInputs(data.inputs);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error uploading file');
      console.error('Upload error:', err);
    }
  };

  const handleProviderChange = (provider: ModelProvider) => {
    // Set default model for the selected provider
    const defaultModel: ModelName =
      provider === 'anthropic'
        ? 'claude-3-5-sonnet-20241022'
        : 'gpt-4o';

    setConfig({ ...config, provider, model: defaultModel });
  };

  const handleRunComparison = async () => {
    if (!config.promptA || !config.promptB) {
      setError('Please enter both prompts');
      return;
    }

    if (inputs.length === 0) {
      setError('Please upload PDF resume(s)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config, inputs }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to run comparison');
      }

      setResults(data.results);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error running comparison');
      console.error('Comparison error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const exportData = {
      config,
      results,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparison-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const availableModels =
    config.provider === 'anthropic' ? ANTHROPIC_MODELS : OPENAI_MODELS;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            Resume Skills Extraction - Prompt Comparison Tool
          </h1>
          <p className="text-gray-600 mb-6">
            Upload PDF resumes and compare two different prompts for extracting skills
          </p>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload PDF Resume(s) (1-2 pages each)
            </label>
            <input
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
            {inputs.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-green-600 font-semibold">
                  Loaded {inputs.length} resume{inputs.length > 1 ? 's' : ''}
                </p>
                <ul className="mt-1 text-xs text-gray-600">
                  {inputs.map((input) => (
                    <li key={input.id}>
                      • {input.filename} ({input.metadata?.pages} page{input.metadata?.pages === '1' ? '' : 's'})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Model Provider Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select LLM Provider
            </label>
            <select
              value={config.provider}
              onChange={(e) =>
                handleProviderChange(e.target.value as ModelProvider)
              }
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="openai">OpenAI (GPT)</option>
            </select>
          </div>

          {/* Specific Model Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Specific Model
            </label>
            <select
              value={config.model}
              onChange={(e) =>
                setConfig({ ...config, model: e.target.value as ModelName })
              }
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableModels.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>

          {/* System Prompt (Optional) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              System Prompt (Optional)
            </label>
            <textarea
              value={config.systemPrompt}
              onChange={(e) =>
                setConfig({ ...config, systemPrompt: e.target.value })
              }
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="You are an expert at analyzing resumes and extracting technical skills..."
            />
          </div>

          {/* Prompt A */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prompt A - Skills Extraction
            </label>
            <textarea
              value={config.promptA}
              onChange={(e) =>
                setConfig({ ...config, promptA: e.target.value })
              }
              rows={6}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Extract all technical skills from this resume. Return as a comma-separated list..."
            />
          </div>

          {/* Prompt B */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prompt B - Skills Extraction (Alternative)
            </label>
            <textarea
              value={config.promptB}
              onChange={(e) =>
                setConfig({ ...config, promptB: e.target.value })
              }
              rows={6}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Identify all technical skills from this resume. Format as JSON array with skill categories..."
            />
          </div>

          {/* Run Button */}
          <button
            onClick={handleRunComparison}
            disabled={loading || !config.promptA || !config.promptB || inputs.length === 0}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white ${
              loading || !config.promptA || !config.promptB || inputs.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Running Comparison...' : 'Run Comparison'}
          </button>

          {/* Results */}
          {results.length > 0 && (
            <ResultsView results={results} onExport={handleExport} />
          )}
        </div>
      </div>
    </div>
  );
}
