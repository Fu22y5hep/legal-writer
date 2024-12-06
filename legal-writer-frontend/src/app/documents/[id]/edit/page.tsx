'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Heading from '@tiptap/extension-heading';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import MenuBar from '@/components/editor/EditorMenuBar';
import AIAssistant from '@/components/editor/AIAssistant';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface Document {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  project: number;
  status?: 'draft' | 'review' | 'final';
}

export default function DocumentEditPage() {
  const params = useParams();
  const router = useRouter();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    editable: true,
    onUpdate: ({ editor }) => {
      console.log('Editor content updated:', editor.getHTML());
    },
  });

  useEffect(() => {
    fetchDocument();
  }, [params.id]);

  useEffect(() => {
    if (document?.content && editor) {
      console.log('Setting editor content:', document.content);
      editor.commands.setContent(document.content);
    }
  }, [document, editor]);

  const fetchDocument = async () => {
    if (!params.id) return;

    try {
      setLoading(true);
      const data = await api.getDocument(params.id as string);
      console.log('Fetched document:', data);
      setDocument(data);
    } catch (error) {
      console.error('Error fetching document:', error);
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!document || !editor) return;
    
    setSaving(true);
    try {
      const updatedContent = editor.getHTML();
      console.log('Saving document with content:', updatedContent);
      
      await api.updateDocument(document.project, parseInt(document.id), {
        content: updatedContent,
        title: document.title,
      });
      
      toast.success('Document saved successfully');
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
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b border-gray-200 bg-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <h1 className="text-lg font-medium">{document?.title}</h1>
          {document?.status && (
            <span className={`
              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${document.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                document.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'}
            `}>
              {document.status}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`
              px-4 py-2 rounded-md text-white
              ${saving
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'}
            `}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto bg-white">
        <div className="max-w-5xl mx-auto p-8">
          <MenuBar editor={editor} />
          <EditorContent editor={editor} className="prose max-w-none mt-4" />
        </div>
      </div>

      <AIAssistant editor={editor} />
    </div>
  );
}
