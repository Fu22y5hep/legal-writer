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

    try {
      setSaving(true);
      const content = editor.getHTML();
      await api.updateDocument(document.project, Number(document.id), {
        title,
        content
      });
      setDocument({ ...document, title, content });
      setEditing(false);
      toast.success('Document saved successfully');
    } catch (err) {
      console.error('Error saving document:', err);
      toast.error('Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Document not found
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        {editing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-3xl font-bold w-full border-b-2 border-gray-300 focus:border-blue-500 outline-none"
          />
        ) : (
          <h1 className="text-3xl font-bold">{title}</h1>
        )}
        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setTitle(document.title);
                  if (editor) {
                    editor.commands.setContent(document.content);
                  }
                }}
                disabled={saving}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        {editing && editor && (
          <div className="border-b border-gray-200 p-2">
            <MenuBar editor={editor} />
          </div>
        )}
        <div className="p-6">
          <EditorContent editor={editor} className="prose max-w-none" />
        </div>
      </div>
    </div>
  );
}
