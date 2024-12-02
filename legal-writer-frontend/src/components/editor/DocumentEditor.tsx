'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';

interface DocumentEditorProps {
  initialContent?: string;
  projectId: string;
  documentId?: string;
}

export default function DocumentEditor({
  initialContent = '',
  projectId,
  documentId,
}: DocumentEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [title, setTitle] = useState('');
  const [isNewDocumentModalOpen, setIsNewDocumentModalOpen] = useState(!documentId);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    },
  });

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor || !title.trim()) {
      toast.error('Please enter a title for the document');
      return;
    }

    setIsSaving(true);
    try {
      const content = editor.getHTML();
      const newDocument = await api.createDocument(Number(projectId), {
        title: title.trim(),
        content,
      });
      
      setIsNewDocumentModalOpen(false);
      router.push(`/projects/${projectId}/documents/${newDocument.id}`);
      toast.success('Document created successfully');
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error('Failed to create document');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Saves the current document. If a document ID exists, it updates the document
   * using the API. If not, it creates a new document. The function sets the saving
   * state, retrieves the content from the editor, and handles API interactions.
   * It provides user feedback via toast notifications and updates the last saved
   * timestamp on successful save.
   */
  const saveDocument = useCallback(async () => {
    if (!editor || isSaving || !title.trim()) return;

    setIsSaving(true);
    const content = editor.getHTML();

    try {
      if (documentId) {
        await api.updateDocument(Number(projectId), Number(documentId), {
          title,
          content,
        });
        toast.success('Document saved');
      } else {
        handleCreateDocument(new Event('submit') as any);
        return;
      }
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    } finally {
      setIsSaving(false);
    }
  }, [editor, documentId, projectId, title, isSaving, router]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!editor || !documentId) return;

    const interval = setInterval(() => {
      saveDocument();
    }, 30000);

    return () => clearInterval(interval);
  }, [editor, saveDocument, documentId]);

  // Save on Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        saveDocument();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [saveDocument]);

  // Load existing document
  useEffect(() => {
    const loadDocument = async () => {
      if (!documentId) return;

      try {
        const doc = await api.getDocument(Number(projectId), Number(documentId));
        if (editor && !editor.isDestroyed) {
          editor.commands.setContent(doc.content);
        }
        setTitle(doc.title);
      } catch (error) {
        console.error('Error loading document:', error);
        toast.error('Failed to load document');
      }
    };

    loadDocument();
  }, [documentId, editor, projectId]);

  if (!editor) {
    return null;
  }

  return (
    <div className="document-editor">
      <form onSubmit={handleCreateDocument}>
        <div className="title-input">
          <label htmlFor="document-title">Document Title</label>
          <input
            type="text"
            id="document-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter document title"
            required
            className="title-field"
          />
        </div>
        <EditorContent editor={editor} />
        <button type="submit" disabled={isSaving} className="save-button">
          {isSaving ? 'Saving...' : 'Save Document'}
        </button>
      </form>
    </div>
  );
}
