'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Heading from '@tiptap/extension-heading';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import MenuBar from '@/components/editor/EditorMenuBar';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';

interface Document {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  project: number;
}

export default function DocumentPage() {
  const params = useParams();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Document,
      Paragraph,
      Text,
      Heading,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: '',
    editable: editing,
  });

  useEffect(() => {
    const fetchDocument = async () => {
      if (!params.id) {
        setError('No document ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await api.getDocument(params.id as string);
        setDocument(data);
        setTitle(data.title);
        if (editor) {
          editor.commands.setContent(data.content);
        }
      } catch (err) {
        console.error('Error fetching document:', err);
        toast.error('Failed to load document');
        setError('Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [params.id, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(editing);
    }
  }, [editing, editor]);

  const handleSave = async () => {
    if (!document || !editor) return;

    setSaving(true);
    try {
      const updatedContent = editor.getHTML();

      // TODO: Implement actual API call
      // await api.updateDocument(document.id, { content: updatedContent, title });

      toast.success('Document saved successfully');

      // Navigate back to project documents view
      router.back();
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex-1">
          {editing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-2 py-1 border rounded"
            />
          ) : (
            <h1 className="text-2xl font-semibold">{title}</h1>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {editing ? (
            <>
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <div className="flex-1 flex flex-col">
          <MenuBar editor={editor} />
          <div className="flex-1 p-4 overflow-auto">
            <EditorContent editor={editor} />
          </div>
        </div>
      ) : (
        <div className="flex-1 p-4 overflow-auto prose max-w-none">
          <ReactMarkdown>{document?.content || ''}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
