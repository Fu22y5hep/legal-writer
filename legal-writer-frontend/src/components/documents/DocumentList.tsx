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
  category?: string;
  tags?: string[];
  status?: 'draft' | 'review' | 'final';
}

interface DocumentListProps {
  projectId: string;
}

export default function DocumentList({ projectId }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    status: 'all',
    category: 'all',
    searchTerm: ''
  });
  const router = useRouter();

  // Add sorting options
  const [sortBy, setSortBy] = useState<'title' | 'updated_at' | 'status'>('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  const handleDocumentClick = (doc: Document) => {
    router.push(`/documents/${doc.id}/edit`);
  };

  const filteredDocuments = documents
    .filter(doc => {
      if (filter.status !== 'all' && doc.status !== filter.status) return false;
      if (filter.category !== 'all' && doc.category !== filter.category) return false;
      if (filter.searchTerm && !doc.title.toLowerCase().includes(filter.searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'title') {
        return sortOrder === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      if (sortBy === 'updated_at') {
        return sortOrder === 'asc'
          ? new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
          : new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
      return 0;
    });

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
      <div className="flex items-center justify-between">
        <div className="flex space-x-4">
          <select
            className="rounded-md border border-gray-300 px-3 py-1"
            value={filter.status}
            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="review">In Review</option>
            <option value="final">Final</option>
          </select>
          
          <input
            type="text"
            placeholder="Search documents..."
            className="rounded-md border border-gray-300 px-3 py-1"
            value={filter.searchTerm}
            onChange={(e) => setFilter(prev => ({ ...prev, searchTerm: e.target.value }))}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <select
            className="rounded-md border border-gray-300 px-3 py-1"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'title' | 'updated_at' | 'status')}
          >
            <option value="title">Title</option>
            <option value="updated_at">Last Updated</option>
            <option value="status">Status</option>
          </select>
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200 border border-gray-200 rounded-md shadow-sm">
        {filteredDocuments.map((doc) => (
          <div
            key={doc.id}
            onClick={() => handleDocumentClick(doc)}
            className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
          >
            <div className="flex items-center min-w-0">
              <FontAwesomeIcon icon={faFile} className="h-5 w-5 text-gray-400 mr-3" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {doc.title}
                </h3>
                <p className="text-sm text-gray-500">
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
          <div className="px-4 py-3 text-sm text-center text-gray-500">
            No documents yet
          </div>
        )}
      </div>
    </div>
  );
}
