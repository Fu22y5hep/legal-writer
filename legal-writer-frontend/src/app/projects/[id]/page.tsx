'use client';

import { useState } from 'react';
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

type TabType = 'documents' | 'chat' | 'notes' | 'resources';

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC'
  }).format(date);
};

export default function ProjectPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [lastEdited] = useState(() => formatDate(new Date()));

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Panel - Project Info & Navigation */}
          <div className="lg:w-1/3 space-y-6">
            {/* Project Header */}
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-2xl font-bold text-gray-900">Project Title</h1>
              <p className="text-sm text-gray-500">Last edited: {lastEdited}</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-4 mb-6">
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
              <button
                onClick={() => setActiveTab('documents')}
                className={tabStyle('documents')}
              >
                Documents
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow p-6">
              {activeTab === 'chat' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">AI Chat Assistant</h3>
                  <ChatAssistant />
                </div>
              )}
              {activeTab === 'notes' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Project Notes</h3>
                  <ProjectNotes projectId={Number(params.id)} />
                </div>
              )}
              {activeTab === 'resources' && (
                <ProjectResources projectId={Number(params.id)} />
              )}
            </div>
          </div>

          {/* Right Panel - Document Editor */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow p-6">
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
                <MenuBar editor={editor} />
                <div className="min-h-[calc(100vh-20rem)] border rounded-lg p-4 mt-2">
                  <EditorContent editor={editor} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
