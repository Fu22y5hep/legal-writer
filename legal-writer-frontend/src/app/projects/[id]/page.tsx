'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Heading from '@tiptap/extension-heading';
import MenuBar from '@/components/editor/EditorMenuBar';
import { useState } from 'react';
import { use } from 'react';
import ChatAssistant from '@/components/chat/ChatAssistant';

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC'
  });
};

export default function ProjectPage({ params }: { params: { id: string } }) {
  const id = use(params);
  const [activeTab, setActiveTab] = useState('editor');
  const [lastEdited] = useState(formatDate(new Date())); // Initialize with current date

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
    content: '<h1>Welcome to your project</h1><p>Start writing your legal document here...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Project {id.id}</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Panel - Project Resources */}
          <div className="lg:w-1/3 space-y-4">
            {/* Project Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Project Details</h2>
              <p className="text-sm text-gray-500">Last edited: {lastEdited}</p>
            </div>

            {/* Project Resources */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Project Resources</h2>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => setActiveTab('chat')}
                  className="text-left px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  💬 AI Chat Assistant
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className="text-left px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  📝 Project Notes
                </button>
              </div>
            </div>

            {/* Additional Panel Based on Tab */}
            {activeTab === 'chat' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">AI Chat Assistant</h3>
                <div className="h-[500px]">
                  <ChatAssistant />
                </div>
              </div>
            )}
            {activeTab === 'notes' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Project Notes</h3>
                <p className="text-gray-500">Notes functionality coming soon...</p>
              </div>
            )}
          </div>

          {/* Right Panel - Document Editor */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow">
              <MenuBar editor={editor} />
              <div className="p-4 min-h-[calc(100vh-12rem)]">
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
