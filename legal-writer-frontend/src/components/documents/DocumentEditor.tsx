import React, { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import CodeBlock from '@tiptap/extension-code-block';
import { api } from '@/lib/api';

interface DocumentEditorProps {
  projectId: number;
}

interface ApiError extends Error {
  status: number;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({ projectId }) => {
  const [content, setContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Document,
      Paragraph,
      Text,
      Heading,
      BulletList,
      OrderedList,
      ListItem,
      CodeBlock,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      saveContent(html);
    },
  });

  const saveContent = useCallback(async (content: string) => {
    if (!projectId) return;
    
    try {
      setIsSaving(true);
      await api.saveProjectDocument(projectId, content);
      setSaveError(null);
      setLastSaved(new Date());
    } catch (err) {
      console.error('Error saving document:', err);
      if (err instanceof Error) {
        const apiError = err as ApiError;
        if (apiError.status === 401) {
          setSaveError('Your session has expired. Please log in again.');
        } else {
          setSaveError(apiError.message || 'Failed to save document');
        }
      } else {
        setSaveError('An unexpected error occurred while saving');
      }
    } finally {
      setIsSaving(false);
    }
  }, [projectId]);

  useEffect(() => {
    const loadContent = async () => {
      if (!projectId) return;

      try {
        setIsLoading(true);
        const data = await api.getProjectDocument(projectId);
        editor?.commands.setContent(data.content || '');
        setError(null);
      } catch (err) {
        console.error('Error loading document:', err);
        if (err instanceof Error) {
          const apiError = err as ApiError;
          if (apiError.status === 401) {
            setError('Your session has expired. Please log in again.');
          } else if (apiError.status === 404) {
            setError('Document not found.');
          } else {
            setError(apiError.message || 'Failed to load document');
          }
        } else {
          setError('An unexpected error occurred while loading');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [projectId, editor]);

  const MenuBar = () => {
    if (!editor) return null;

    return (
      <div className="border-b border-gray-200 p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1 rounded ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h8a4 4 0 100-8H6v8zm0 0h8a4 4 0 110 8H6v-8z" />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1 rounded ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1 rounded ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </button>
        </div>
        <div className="text-sm text-gray-500">
          {isSaving ? 'Saving...' : lastSaved ? `Last saved ${lastSaved.toLocaleTimeString()}` : ''}
          {saveError && <span className="text-red-500">{saveError}</span>}
        </div>
      </div>
    );
  };

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <MenuBar />
      <div className="flex-1 p-4 overflow-y-auto">
        <EditorContent editor={editor} className="prose max-w-none" />
      </div>
    </div>
  );
};

export default DocumentEditor;
