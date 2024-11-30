import React, { useState } from 'react';
import { api } from '@/lib/api';

interface ExtractedContentProps {
  resourceId: number;
  content?: string;
  error?: string;
  lastExtracted?: string;
  onExtractComplete?: () => void;
}

export const ExtractedContent: React.FC<ExtractedContentProps> = ({
  resourceId,
  content,
  error,
  lastExtracted,
  onExtractComplete,
}) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState(error);
  const [extractedContent, setExtractedContent] = useState(content);

  const handleExtract = async () => {
    setIsExtracting(true);
    setExtractionError(undefined);

    try {
      const response = await api.extractResourceContent(resourceId);
      setExtractedContent(response.content_extracted);
      setExtractionError(response.extraction_error);
      
      if (response.content_extracted) {
        // toast({
        //   title: 'Content extracted successfully',
        //   status: 'success',
        //   duration: 3000,
        // });
      } else if (response.extraction_error) {
        // toast({
        //   title: 'Extraction failed',
        //   description: response.extraction_error,
        //   status: 'error',
        //   duration: 5000,
        // });
      }

      onExtractComplete?.();
    } catch (err: any) {
      setExtractionError(err.message);
      // toast({
      //   title: 'Failed to extract content',
      //   description: err.message,
      //   status: 'error',
      //   duration: 5000,
      // });
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Extraction Status */}
      {lastExtracted && (
        <p className="text-sm text-gray-600">
          Last extracted: {new Date(lastExtracted).toLocaleString()}
        </p>
      )}

      {/* Error Display */}
      {extractionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Extraction Error: </strong>
          <span className="block sm:inline">{extractionError}</span>
        </div>
      )}

      {/* Content Display */}
      {extractedContent ? (
        <div className="bg-gray-50 p-4 rounded-md max-h-[500px] overflow-y-auto whitespace-pre-wrap">
          <p className="text-gray-800">{extractedContent}</p>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded relative">
          <p>No content has been extracted yet.</p>
        </div>
      )}

      {/* Extract Button */}
      <button
        onClick={handleExtract}
        disabled={isExtracting}
        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          isExtracting ? 'opacity-75 cursor-not-allowed' : ''
        }`}
      >
        {isExtracting ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Extracting...
          </>
        ) : (
          extractedContent ? 'Re-extract Content' : 'Extract Content'
        )}
      </button>
    </div>
  );
};
