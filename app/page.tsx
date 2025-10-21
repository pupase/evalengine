'use client';

import { useState } from 'react';
import { ModelProvider, PromptConfig, InputRow, ComparisonResult } from '@/types';
import ResultsView from '@/components/ResultsView';

export default function Home() {
  const [config, setConfig] = useState<PromptConfig>({
    systemPrompt: '',
    promptA: '',
    promptB: '',
    model: 'anthropic',
  });

  const [inputs, setInputs] = useState<InputRow[]>([]);
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/parse-csv', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse CSV');
      }

      setInputs(data.inputs);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error uploading file');
      console.error('Upload error:', err);
    }
  };

  const handleRunComparison = async () => {
    if (!config.promptA || !config.promptB) {
      setError('Please enter both prompts');
      return;
    }

    if (inputs.length === 0) {
      setError('Please upload a CSV file with data');
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

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">
            Prompt Comparison Tool
          </h1>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
            {inputs.length > 0 && (
              <p className="mt-2 text-sm text-green-600">
                Loaded {inputs.length} rows
              </p>
            )}
          </div>

          {/* Model Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Model Provider
            </label>
            <select
              value={config.model}
              onChange={(e) =>
                setConfig({ ...config, model: e.target.value as ModelProvider })
              }
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="anthropic">Anthropic Claude</option>
              <option value="openai">OpenAI GPT</option>
              <option value="google">Google Gemini</option>
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
              placeholder="Enter system-level instructions or context..."
            />
          </div>

          {/* Prompt A */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prompt A
            </label>
            <textarea
              value={config.promptA}
              onChange={(e) =>
                setConfig({ ...config, promptA: e.target.value })
              }
              rows={6}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your first prompt variation..."
            />
          </div>

          {/* Prompt B */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prompt B
            </label>
            <textarea
              value={config.promptB}
              onChange={(e) =>
                setConfig({ ...config, promptB: e.target.value })
              }
              rows={6}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your second prompt variation..."
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
