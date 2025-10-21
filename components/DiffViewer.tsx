'use client';

import { useMemo } from 'react';
import * as Diff from 'diff';

interface DiffViewerProps {
  oldText: string;
  newText: string;
}

export default function DiffViewer({ oldText, newText }: DiffViewerProps) {
  const changes = useMemo(() => {
    return Diff.diffWords(oldText, newText);
  }, [oldText, newText]);

  return (
    <div className="font-mono text-sm bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
      {changes.map((part, index) => {
        const color = part.added
          ? 'bg-green-200 text-green-900'
          : part.removed
          ? 'bg-red-200 text-red-900'
          : 'text-gray-800';

        return (
          <span key={index} className={color}>
            {part.value}
          </span>
        );
      })}
    </div>
  );
}
