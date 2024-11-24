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

export default function ProjectPage({ params }: { params: { id: string } }) {
  const projectId = use(Promise.resolve(params.id));
  const [activeTab, setActiveTab] = useState('editor');

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

  const TabButton = ({ id, label }: { id: string; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 font-medium text-sm rounded-lg ${
        activeTab === id
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Project {projectId}</h1>
          <p className="mt-1 text-sm text-gray-500">Last edited: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Panel */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Project Resources</h2>
              <div className="space-y-2">
                <TabButton id="editor" label="Document Editor" />
                <TabButton id="chat" label="AI Chat" />
                <TabButton id="notes" label="Project Notes" />
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow">
              {activeTab === 'editor' && (
                <div>
                  <MenuBar editor={editor} />
                  <div className="p-4">
                    <EditorContent editor={editor} />
                  </div>
                </div>
              )}
              {activeTab === 'chat' && (
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">AI Chat</h3>
                  <p className="text-gray-500">Chat functionality coming soon...</p>
                </div>
              )}
              {activeTab === 'notes' && (
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Project Notes</h3>
                  <p className="text-gray-500">Notes functionality coming soon...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
