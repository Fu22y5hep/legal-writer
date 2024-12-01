'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface SummarizeButtonProps {
  resourceId: number;
  projectId: number;
  resourceTitle: string;
  onSummarized?: () => void;
}

const extractCaseCitation = (title: string): string => {
  // Remove file extension if present and trim whitespace
  return title.replace(/\.(pdf|doc|docx)$/i, '').trim();
};

const SummarizeButton: React.FC<SummarizeButtonProps> = ({ 
  resourceId, 
  projectId,
  resourceTitle,
  onSummarized 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSummarize = async () => {
    setIsLoading(true);
    try {
      console.log('Starting summarization for resource:', { resourceId, projectId });
      
      // Get the summary from the resource
      const summaryResponse = await api.summarizeResource(resourceId);
      console.log('Summary API Response:', summaryResponse);
      
      let summary: string;
      if (typeof summaryResponse === 'string') {
        summary = summaryResponse;
      } else if (typeof summaryResponse === 'object' && summaryResponse !== null) {
        summary = summaryResponse.summary || summaryResponse.content || JSON.stringify(summaryResponse);
      } else {
        throw new Error('Invalid summary response format');
      }
      
      if (!summary) {
        throw new Error('No summary was generated');
      }

      const caseCitation = extractCaseCitation(resourceTitle);
      console.log('Creating note with details:', { 
        caseCitation,
        resourceTitle,
        length: summary.length,
        summaryStart: summary.substring(0, 100) // First 100 chars of summary
      });
      
      // Create a note with the summary
      const noteData = {
        content: summary,
        title: caseCitation,
        name_identifier: caseCitation,
        project: projectId
      };
      
      console.log('Sending note creation request with data:', noteData);
      const noteResponse = await api.createNote(noteData);
      console.log('Note creation response received:', noteResponse);
      
      toast.success('Summary created and saved as note');
      onSummarized?.();
    } catch (error) {
      console.error('Summarization failed:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        resourceId,
        projectId
      });
      
      let errorMessage = 'Failed to create summary';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSummarize}
      disabled={isLoading}
      className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 disabled:text-gray-400"
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Summarizing...
        </>
      ) : (
        'Summarize'
      )}
    </button>
  );
};

export default SummarizeButton;
