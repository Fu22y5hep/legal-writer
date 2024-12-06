'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import EnhancedEditor from '@/components/editor/EnhancedEditor';
import DocumentHeader from '@/components/editor/DocumentHeader';
import TemplateSelector, { Template } from '@/components/documents/TemplateSelector';
import VersionHistory, { Version } from '@/components/documents/VersionHistory';
import { PlusIcon, FolderIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Document {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  category?: string;
  tags?: string[];
  status: 'draft' | 'review' | 'final';
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
    category: 'Contract',
    tags: ['contract', 'agreement'],
    status: 'draft',
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
    category: 'Brief',
    tags: ['brief', 'legal'],
    status: 'review',
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDocumentData, setNewDocumentData] = useState({
    title: '',
    category: '',
    tags: [] as string[],
  });
  const router = useRouter();

  const handleCreateDocument = () => {
    setShowCreateModal(true);
  };

  const handleCreateSubmit = () => {
    if (!newDocumentData.title.trim()) {
      toast.error('Please enter a document title');
      return;
    }

    const newDoc: Document = {
      id: Date.now(),
      title: newDocumentData.title,
      content: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: newDocumentData.category,
      tags: newDocumentData.tags,
      status: 'draft',
      versions: [],
    };

    setDocuments([newDoc, ...documents]);
    setSelectedDoc(newDoc);
    setShowCreateModal(false);
    setNewDocumentData({ title: '', category: '', tags: [] });
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

      // Update the documents list
      setDocuments(docs =>
        docs.map(doc => (doc.id === selectedDoc.id ? updatedDoc : doc))
      );

      toast.success('Document saved successfully');
      
      // Simply clear the selected document to return to list view
      setSelectedDoc(null);
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
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
    <div className="h-screen flex">
      {/* Left sidebar with document list */}
      <div className="w-64 flex-none bg-white border-r border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={handleCreateDocument}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Document
          </button>
        </div>

        {/* Document List Component */}
        <div className="flex-1 overflow-y-auto">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className={`
                p-4 cursor-pointer border-b border-gray-200
                ${selectedDoc?.id === doc.id ? 'bg-blue-50' : 'hover:bg-gray-50'}
              `}
            >
              <div className="flex items-center">
                <FolderIcon className="h-5 w-5 text-gray-400 mr-2" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {new Date(doc.updated_at).toLocaleDateString()}
                  </p>
                  <span className={`
                    inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                    ${doc.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      doc.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'}
                  `}>
                    {doc.status}
                  </span>
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

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
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
            <div className="flex-1 overflow-hidden">
              <EnhancedEditor
                initialContent={selectedDoc.content}
                onSave={handleSaveDocument}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No document selected</h3>
              <p className="mt-1 text-sm text-gray-500">Select a document from the sidebar to start editing</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Document Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium mb-4">Create New Document</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={newDocumentData.title}
                  onChange={(e) => setNewDocumentData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  value={newDocumentData.category}
                  onChange={(e) => setNewDocumentData(prev => ({ ...prev, category: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSubmit}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template selector modal */}
      {showTemplates && (
        <TemplateSelector
          onSelect={(template: Template) => {
            const newDoc: Document = {
              id: Date.now(),
              title: template.title,
              content: template.content,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              category: '',
              tags: [],
              status: 'draft',
              versions: [],
            };
            setDocuments([newDoc, ...documents]);
            setSelectedDoc(newDoc);
            setShowTemplates(false);
          }}
          onClose={() => setShowTemplates(false)}
        />
      )}

      {/* Version history modal */}
      {showHistory && selectedDoc && (
        <VersionHistory
          versions={selectedDoc.versions || []}
          onClose={() => setShowHistory(false)}
          onRevert={(version) => {
            if (selectedDoc) {
              setSelectedDoc({
                ...selectedDoc,
                content: version.content,
                updated_at: new Date().toISOString(),
              });
              setShowHistory(false);
            }
          }}
        />
      )}
    </div>
  );
}
