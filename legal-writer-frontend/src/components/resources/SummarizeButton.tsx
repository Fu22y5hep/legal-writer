'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

interface SummarizeButtonProps {
  resourceId: number;
  onSummarizeComplete: () => void;
}

export function SummarizeButton({ resourceId, onSummarizeComplete }: SummarizeButtonProps) {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async () => {
    setIsSummarizing(true);
    setError(null);

    try {
      await api.summarizeResource(resourceId);
      onSummarizeComplete();
    } catch (err: any) {
      console.error('Summarization error:', err);
      setError(err.message || 'Failed to summarize document');
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="inline-block">
      <button
        onClick={handleSummarize}
        disabled={isSummarizing}
        className={`
          px-3 py-1 text-sm font-medium rounded-md
          ${isSummarizing 
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}
        `}
      >
        {isSummarizing ? 'Summarizing...' : 'Summarize'}
      </button>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
