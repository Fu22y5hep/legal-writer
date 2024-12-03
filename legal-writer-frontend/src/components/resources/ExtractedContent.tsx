import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { SelectableText } from '../common/SelectableText';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

interface ExtractedContentProps {
  resourceId: number;
  projectId: number;
  content?: string;
  error?: string;
  lastExtracted?: string;
  onExtractComplete?: () => void;
  searchQuery?: string;
  currentMatchIndex?: number;
  onMatchesFound?: (count: number) => void;
}

export const ExtractedContent: React.FC<ExtractedContentProps> = ({
  resourceId,
  projectId,
  content,
  error,
  lastExtracted,
  onExtractComplete,
  searchQuery = '',
  currentMatchIndex = 0,
  onMatchesFound,
}) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (content && searchQuery) {
      const matches = content.match(new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'));
      const matchCount = matches ? matches.length : 0;
      onMatchesFound?.(matchCount);

      // Scroll to current match
      if (contentRef.current) {
        const marks = contentRef.current.getElementsByTagName('mark');
        if (marks.length > currentMatchIndex) {
          const currentMark = marks[currentMatchIndex];
          currentMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Remove active class from all marks
          Array.from(marks).forEach(mark => mark.classList.remove('bg-yellow-300', 'ring-2'));
          // Add active class to current mark
          currentMark.classList.add('bg-yellow-300', 'ring-2');
        }
      }
    }
  }, [searchQuery, currentMatchIndex, content]);

  const handleExtract = async () => {
    setIsExtracting(true);
    setExtractionError(null);

    try {
      const response = await api.extractResourceContent(resourceId);
      setExtractionError(response.extraction_error);
      
      if (response.content_extracted) {
        toast.success('Content extracted successfully');
      } else if (response.extraction_error) {
        toast.error('Extraction failed: ' + response.extraction_error);
      }

      onExtractComplete?.();
    } catch (err: any) {
      setExtractionError(err.message || 'Failed to extract content');
      toast.error('Failed to extract content: ' + err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCopy = async (selectedText: string, title: string) => {
    if (isCreatingNote || !selectedText.trim()) return;

    setIsCreatingNote(true);
    try {
      // Create a new note with the selected text
      await api.createNote({
        content: selectedText.trim(),
        title: title,
        name_identifier: `note_${Date.now()}`,
        project: projectId,
      });

      // Copy to clipboard as well
      await navigator.clipboard.writeText(selectedText);
      
      toast.success('Note created successfully');
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
    } finally {
      setIsCreatingNote(false);
    }
  };

  // Function to highlight search matches
  const highlightMatches = (text: string) => {
    if (!searchQuery?.trim()) return text;

    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === searchQuery.toLowerCase() ? 
        `<mark class="bg-yellow-200 px-1 rounded transition-all duration-200">${part}</mark>` : 
        part
    ).join('');
  };

  // Custom components for ReactMarkdown
  const components = {
    p: ({ children }: { children: React.ReactNode }) => {
      if (typeof children === 'string') {
        return (
          <p 
            className="mb-4 text-gray-700" 
            dangerouslySetInnerHTML={{ 
              __html: highlightMatches(children) 
            }} 
          />
        );
      }
      return <p className="mb-4 text-gray-700">{children}</p>;
    },
  };

  if (error || extractionError) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Extraction Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error || extractionError}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center">
        <button
          onClick={handleExtract}
          disabled={isExtracting}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isExtracting ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {isExtracting ? 'Extracting...' : 'Extract Content'}
        </button>
        {lastExtracted && (
          <p className="mt-2 text-sm text-gray-500">
            Last extracted: {new Date(lastExtracted).toLocaleString()}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Extraction Status */}
      {lastExtracted && (
        <p className="text-sm text-gray-600">
          Last extracted: {new Date(lastExtracted).toLocaleString()}
        </p>
      )}

      {/* Content Display */}
      <div className="bg-gray-50 p-4 rounded-md max-h-[500px] overflow-y-auto">
        <SelectableText onCopy={handleCopy}>
          <div 
            ref={contentRef}
            className="prose prose-sm max-w-none text-gray-800"
          >
            <ReactMarkdown components={components}>{content}</ReactMarkdown>
          </div>
        </SelectableText>
      </div>
    </div>
  );
};
