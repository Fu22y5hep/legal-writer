'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Heading from '@tiptap/extension-heading';
import MenuBar from '@/components/editor/EditorMenuBar';
import ChatAssistant from '@/components/chat/ChatAssistant';
import ProjectResources from '@/components/projects/ProjectResources';
import ProjectNotes from '@/components/projects/ProjectNotes';
import { api } from '@/lib/api';

type TabType = 'editor' | 'chat' | 'notes' | 'resources';

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

export default function ProjectPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<TabType>('editor');
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await api.getProject(Number(params.id));
        setProject(data);
        setError(null);
      } catch (err) {
        setError('Failed to load project');
        console.error('Error fetching project:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [params.id]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Document,
      Paragraph,
      Text,
      Heading.configure({
        levels: [1, 2],
      }),
    ],
    content: '<p>Start writing your document...</p>',
  });

  const tabStyle = (tab: TabType) => `px-4 py-2 font-medium rounded-lg ${
    activeTab === tab
      ? 'bg-blue-100 text-blue-700'
      : 'text-gray-600 hover:bg-gray-100'
  }`;

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setActiveTab('editor')}
            className={tabStyle('editor')}
          >
            Editor
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={tabStyle('chat')}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={tabStyle('notes')}
          >
            Notes
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={tabStyle('resources')}
          >
            Resources
          </button>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'editor' && (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Document Editor</h2>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100">
                    Save Draft
                  </button>
                  <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Publish
                  </button>
                </div>
              </div>
              <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none">
                {editor && (
                  <>
                    <MenuBar editor={editor} />
                    <div className="min-h-[calc(100vh-24rem)] border rounded-lg p-4 mt-2">
                      <EditorContent editor={editor} />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'chat' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">AI Chat Assistant</h2>
              <ChatAssistant />
            </div>
          )}
          
          {activeTab === 'notes' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Project Notes</h2>
              <ProjectNotes projectId={Number(params.id)} />
            </div>
          )}
          
          {activeTab === 'resources' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Project Resources</h2>
              <ProjectResources projectId={Number(params.id)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
