'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DocumentEditorProps {
  initialContent?: string;
  projectId?: number;
  documentId?: number;
}

export default function DocumentEditor({
  initialContent = '',
  projectId,
  documentId,
}: DocumentEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const router = useRouter();

  // Autosave functionality
  useEffect(() => {
    const saveTimeout = setTimeout(async () => {
      if (content !== initialContent) {
        await handleSave();
      }
    }, 2000);

    return () => clearTimeout(saveTimeout);
  }, [content, initialContent]);

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      // TODO: Implement save functionality
      // await api.saveDocument({
      //   id: documentId,
      //   content,
      //   projectId,
      // });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save document:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            className="px-3 py-1 text-sm font-medium text-gray-700 hover:text-gray-900"
            onClick={() => document.execCommand('bold')}
          >
            Bold
          </button>
          <button
            className="px-3 py-1 text-sm font-medium text-gray-700 hover:text-gray-900"
            onClick={() => document.execCommand('italic')}
          >
            Italic
          </button>
          <button
            className="px-3 py-1 text-sm font-medium text-gray-700 hover:text-gray-900"
            onClick={() => document.execCommand('insertUnorderedList')}
          >
            List
          </button>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          {lastSaved && (
            <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
          )}
          <button
            className={`
              px-4 py-2 rounded-md text-white
              ${isSaving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              }
            `}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-6 overflow-auto">
        <div
          className="prose max-w-none h-full"
          contentEditable
          onInput={(e) => setContent(e.currentTarget.innerHTML)}
          dangerouslySetInnerHTML={{ __html: content }}
          style={{ minHeight: '100%' }}
        />
      </div>
    </div>
  );
}
