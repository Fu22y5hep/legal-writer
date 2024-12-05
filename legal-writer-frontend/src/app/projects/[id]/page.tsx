'use client';

import { useState, useEffect, use } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Heading from '@tiptap/extension-heading';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import MenuBar from '@/components/editor/EditorMenuBar';
import ChatAssistant from '@/components/chat/ChatAssistant';
import ProjectResources from '@/components/projects/ProjectResources';
import ProjectNotes from '@/components/projects/ProjectNotes';
import DocumentList from '@/components/documents/DocumentList';
import { api } from '@/lib/api';
import { Suspense } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faComment, faStickyNote, faFolder } from '@fortawesome/free-solid-svg-icons';

export type TabType = 'documents' | 'editor' | 'chat' | 'notes' | 'resources';

interface Project {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  }).format(new Date(date));
};

export default function ProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get('tab') as TabType) || 'documents';
  
  const projectId = use(params).id;
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

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
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await api.getProject(Number(projectId));
        setProject(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching project:', error);
        setError('Failed to load project');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleTabChange = (newTab: TabType) => {
    router.push(`/projects/${projectId}?tab=${newTab}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{project?.title}</h1>
          <p className="text-gray-500">{project?.description}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          {tab === 'documents' && (
            <Suspense fallback={<div>Loading documents...</div>}>
              <DocumentList projectId={projectId} />
            </Suspense>
          )}
          {tab === 'editor' && (
            <div className="h-full flex flex-col">
              <MenuBar editor={editor} />
              <EditorContent editor={editor} className="flex-1 overflow-y-auto p-4" />
            </div>
          )}
          {tab === 'chat' && <ChatAssistant projectId={projectId} />}
          {tab === 'notes' && <ProjectNotes projectId={Number(projectId)} />}
          {tab === 'resources' && <ProjectResources projectId={Number(projectId)} />}
        </div>
      </div>
    </div>
  );
}
