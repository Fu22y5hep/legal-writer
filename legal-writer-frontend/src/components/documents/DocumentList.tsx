'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
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

interface DocumentListProps {
  projectId: string;
}

export default function DocumentList({ projectId }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!projectId) {
      console.error('No project ID provided');
      setError('Invalid project ID');
      setLoading(false);
      return;
    }
    
    fetchDocuments();
  }, [projectId]);

  const fetchDocuments = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching documents for project:', projectId);
      const data = await api.getDocuments(Number(projectId));
      console.log('Received documents response:', data);
      
      // Handle the case where data is null or undefined
      if (!data) {
        console.error('No data received from API');
        setError('No response from server');
        return;
      }

      // Handle non-array responses
      if (!Array.isArray(data)) {
        console.error('Invalid response format, expected array but got:', typeof data);
        setError('Invalid response format from server');
        return;
      }

      // Validate document structure
      const validDocuments = data.filter(doc => {
        const isValid = doc && typeof doc === 'object' && 
          'id' in doc && 
          'title' in doc && 
          'created_at' in doc && 
          'updated_at' in doc;
        
        if (!isValid) {
          console.error('Invalid document structure:', doc);
        }
        
        return isValid;
      });

      console.log('Valid documents:', validDocuments);
      setDocuments(validDocuments);
      
      if (validDocuments.length === 0 && data.length > 0) {
        setError('Documents data is malformed');
      } else {
        setError(null);
      }
    } catch (error: any) {
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        data: error.data,
        stack: error.stack
      });
      
      let errorMessage = 'Failed to load documents';
      
      if (error.status === 401) {
        errorMessage = 'Please log in to view documents';
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to view these documents';
      } else if (error.status === 404) {
        errorMessage = 'Project not found';
      }
      
      if (error.data && typeof error.data === 'object') {
        errorMessage = error.data.detail || error.data.message || errorMessage;
      } else if (typeof error.data === 'string' && error.data.trim()) {
        errorMessage = error.data;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    if (!projectId) {
      toast.error('No project selected');
      return;
    }

    try {
      const numericProjectId = Number(projectId);
      if (isNaN(numericProjectId) || numericProjectId <= 0) {
        toast.error('Invalid project ID');
        return;
      }

      const newDocument = await api.createDocument(numericProjectId, {
        title: 'Untitled Document',
        content: 'Enter your document content here...'  
      });

      if (!newDocument?.id) {
        throw new Error('Invalid response: Missing document ID');
      }

      toast.success('Document created successfully');
      
      // Navigate to the new document immediately
      router.push(`/documents/${newDocument.id}`);
      
      // Refresh the documents list in the background
      fetchDocuments();
    } catch (error: any) {
      console.error('Error creating document:', error);
      
      // Extract the most relevant error message
      let errorMessage = 'Failed to create document';
      if (error.message && error.message !== 'API request failed') {
        errorMessage = error.message;
      } else if (error.data) {
        errorMessage = typeof error.data === 'object' ? 
          Object.values(error.data).flat().join(', ') : 
          error.data.toString();
      }
      
      toast.error(errorMessage);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await api.deleteDocument(Number(projectId), Number(documentId));
      setDocuments(documents.filter(doc => doc.id !== documentId));
      toast.success('Document deleted');
    } catch (error: any) {
      console.error('Error deleting document:', {
        message: error.message,
        status: error.status,
        data: error.data
      });
      
      const message = error.data?.detail || error.message || 'Failed to delete document';
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-48 space-y-4">
        <div className="text-red-500">{error}</div>
        <button
          onClick={() => fetchDocuments()}
          className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Documents</h2>
        <button
          onClick={handleCreateDocument}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
          New Document
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="divide-y divide-gray-200 border border-gray-200 rounded-md shadow-sm">
        {documents.map((document, index) => (
          <div
            key={document.id}
            className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors duration-150 ease-in-out`}
          >
            <div 
              className="px-4 py-3 cursor-pointer"
              onClick={() => router.push(`/documents/${document.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-grow min-w-0">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <FontAwesomeIcon icon={faFile} className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {document.title}
                        </h3>
                        <div className="flex items-center gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDocument(document.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors duration-150"
                          >
                            <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-0.5 flex items-center text-xs text-gray-500">
                        <span>{new Date(document.created_at).toLocaleDateString()}</span>
                        <span className="mx-1.5">•</span>
                        <span>Last modified: {new Date(document.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {documents.length === 0 && (
          <div className="px-4 py-3 text-sm text-center text-gray-500">
            No documents yet
          </div>
        )}
      </div>
    </div>
  );
}
