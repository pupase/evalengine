'use client';

import { ComparisonResult } from '@/types';
import { useState } from 'react';
import DiffViewer from './DiffViewer';

interface ResultsViewProps {
  results: ComparisonResult[];
  onExport: () => void;
}

export default function ResultsView({ results, onExport }: ResultsViewProps) {
  const [selectedResult, setSelectedResult] = useState<number>(0);

  if (results.length === 0) {
    return null;
  }

  const currentResult = results[selectedResult];

  return (
    <div className="mt-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Comparison Results</h2>
        <button
          onClick={onExport}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Export Results
        </button>
      </div>

      {/* Result selector */}
      <div className="flex items-center gap-4">
        <span className="font-semibold">Result:</span>
        <select
          value={selectedResult}
          onChange={(e) => setSelectedResult(Number(e.target.value))}
          className="px-3 py-2 border rounded-lg"
        >
          {results.map((result, index) => (
            <option key={result.inputId} value={index}>
              {index + 1} - {result.inputId}
            </option>
          ))}
        </select>
        <span className="text-gray-600">
          ({selectedResult + 1} of {results.length})
        </span>
      </div>

      {/* Input */}
      <div>
        <h3 className="font-semibold mb-2">Input:</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="whitespace-pre-wrap">{currentResult.input}</p>
        </div>
      </div>

      {/* Side-by-side outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prompt A Output */}
        <div>
          <h3 className="font-semibold mb-2 text-blue-600">Prompt A Output:</h3>
          {currentResult.promptAError ? (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-800">
              <p className="font-semibold">Error:</p>
              <p>{currentResult.promptAError}</p>
            </div>
          ) : (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="whitespace-pre-wrap">{currentResult.promptAOutput}</p>
            </div>
          )}
        </div>

        {/* Prompt B Output */}
        <div>
          <h3 className="font-semibold mb-2 text-green-600">Prompt B Output:</h3>
          {currentResult.promptBError ? (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-800">
              <p className="font-semibold">Error:</p>
              <p>{currentResult.promptBError}</p>
            </div>
          ) : (
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="whitespace-pre-wrap">{currentResult.promptBOutput}</p>
            </div>
          )}
        </div>
      </div>

      {/* Diff View */}
      {!currentResult.promptAError && !currentResult.promptBError && (
        <div>
          <h3 className="font-semibold mb-2">Difference Highlighting:</h3>
          <DiffViewer
            oldText={currentResult.promptAOutput}
            newText={currentResult.promptBOutput}
          />
        </div>
      )}
    </div>
  );
}
