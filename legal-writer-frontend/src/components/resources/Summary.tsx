'use client';

interface SummaryProps {
  summary: string | null;
  lastSummarized: string | null;
}

export function Summary({ summary, lastSummarized }: SummaryProps) {
  if (!summary && !lastSummarized) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-white rounded-lg border">
      <h4 className="text-sm font-medium text-gray-900 mb-2">Document Summary</h4>
      {summary ? (
        <>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{summary}</p>
          {lastSummarized && (
            <p className="mt-2 text-xs text-gray-500">
              Last summarized: {new Date(lastSummarized).toLocaleString()}
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-500">
          Summary not available. Try clicking the Summarize button.
        </p>
      )}
    </div>
  );
}
