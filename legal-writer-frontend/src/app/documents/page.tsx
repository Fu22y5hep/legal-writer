'use client';

import React, { useState } from 'react';
import EnhancedEditor from '@/components/editor/EnhancedEditor';
import DocumentHeader from '@/components/editor/DocumentHeader';
import TemplateSelector, { Template } from '@/components/documents/TemplateSelector';
import VersionHistory, { Version } from '@/components/documents/VersionHistory';
import { PlusIcon, FolderIcon } from '@heroicons/react/24/outline';

interface Document {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  versions?: Version[];
}

// Mock data for development
const mockDocuments: Document[] = [
  {
    id: 1,
    title: 'Contract Agreement',
    content: '<h1>Contract Agreement</h1><p>This agreement is made between...</p>',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T11:45:00Z',
    versions: [
      {
        id: 1,
        document_id: 1,
        content: '<h1>Contract Agreement</h1><p>This agreement is made between...</p>',
        created_at: '2024-01-15T11:45:00Z',
        created_by: 'John Doe',
        comment: 'Latest version',
      },
      {
        id: 2,
        document_id: 1,
        content: '<h1>Contract Agreement</h1><p>Initial draft</p>',
        created_at: '2024-01-15T10:30:00Z',
        created_by: 'John Doe',
        comment: 'Initial version',
      },
    ],
  },
  {
    id: 2,
    title: 'Legal Brief',
    content: '<h1>Legal Brief</h1><p>In the matter of...</p>',
    created_at: '2024-01-14T15:45:00Z',
    updated_at: '2024-01-14T16:30:00Z',
    versions: [],
  },
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState(mockDocuments);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleCreateDocument = () => {
    setShowTemplates(true);
  };

  const handleTemplateSelect = (template: Template) => {
    const newDoc: Document = {
      id: Date.now(),
      title: template.title,
      content: template.content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      versions: [],
    };
    setDocuments([newDoc, ...documents]);
    setSelectedDoc(newDoc);
    setShowTemplates(false);
  };

  const handleSaveDocument = async (content: string) => {
    if (!selectedDoc) return;

    setIsSaving(true);
    try {
      // TODO: Implement actual API call
      // const savedDoc = await api.saveDocument({ ...selectedDoc, content });
      
      const updatedDoc = {
        ...selectedDoc,
        content,
        updated_at: new Date().toISOString(),
        versions: [
          {
            id: Date.now(),
            document_id: selectedDoc.id,
            content,
            created_at: new Date().toISOString(),
            created_by: 'John Doe', // TODO: Get from auth context
            comment: 'Auto-saved version',
          },
          ...(selectedDoc.versions || []),
        ],
      };

      setDocuments(prevDocs =>
        prevDocs.map(doc =>
          doc.id === selectedDoc.id ? updatedDoc : doc
        )
      );
      setSelectedDoc(updatedDoc);
    } catch (error) {
      console.error('Failed to save document:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitleChange = async (newTitle: string) => {
    if (!selectedDoc) return;

    try {
      // TODO: Implement actual API call
      // await api.updateDocumentTitle(selectedDoc.id, newTitle);
      
      const updatedDoc = {
        ...selectedDoc,
        title: newTitle,
        updated_at: new Date().toISOString(),
      };

      setDocuments(prevDocs =>
        prevDocs.map(doc =>
          doc.id === selectedDoc.id ? updatedDoc : doc
        )
      );
      setSelectedDoc(updatedDoc);
    } catch (error) {
      console.error('Failed to update title:', error);
    }
  };

  const handleRestoreVersion = async (version: Version) => {
    if (!selectedDoc) return;

    try {
      // TODO: Implement actual API call
      // await api.restoreVersion(version.id);
      
      const updatedDoc = {
        ...selectedDoc,
        content: version.content,
        updated_at: new Date().toISOString(),
      };

      setDocuments(prevDocs =>
        prevDocs.map(doc =>
          doc.id === selectedDoc.id ? updatedDoc : doc
        )
      );
      setSelectedDoc(updatedDoc);
      setShowHistory(false);
    } catch (error) {
      console.error('Failed to restore version:', error);
    }
  };

  const handleDuplicateDocument = async () => {
    if (!selectedDoc) return;

    const duplicatedDoc: Document = {
      ...selectedDoc,
      id: Date.now(),
      title: `${selectedDoc.title} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      versions: [],
    };

    setDocuments([duplicatedDoc, ...documents]);
    setSelectedDoc(duplicatedDoc);
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex">
      {/* Document list sidebar */}
      <div className="w-64 flex-none border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={handleCreateDocument}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Document
          </button>

          <div className="mt-4">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-10rem)]">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className={`
                p-4 cursor-pointer border-b border-gray-200
                ${selectedDoc?.id === doc.id
                  ? 'bg-blue-50'
                  : 'hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center">
                <FolderIcon className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Updated: {new Date(doc.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {filteredDocuments.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No documents found
            </div>
          )}
        </div>
      </div>

      {/* Document editor */}
      <div className="flex-1 flex flex-col">
        {selectedDoc ? (
          <>
            <DocumentHeader
              title={selectedDoc.title}
              createdAt={selectedDoc.created_at}
              updatedAt={selectedDoc.updated_at}
              onTitleChange={handleTitleChange}
              onDuplicate={handleDuplicateDocument}
              onShowHistory={() => setShowHistory(true)}
              isSaving={isSaving}
            />
            <div className="flex-1">
              <EnhancedEditor
                initialContent={selectedDoc.content}
                onSave={handleSaveDocument}
              />
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p>Select a document to view or edit</p>
              <button
                onClick={handleCreateDocument}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                or create a new one
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Template selector modal */}
      {showTemplates && (
        <TemplateSelector
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
        />
      )}

      {/* Version history modal */}
      {showHistory && selectedDoc && (
        <VersionHistory
          versions={selectedDoc.versions || []}
          currentVersion={selectedDoc.versions?.[0]?.id || 0}
          onRestore={handleRestoreVersion}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}
