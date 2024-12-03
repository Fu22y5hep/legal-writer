'use client';

import { useState, useEffect } from 'react';
import FileUpload from '../upload/FileUpload';
import { api } from '@/lib/api';
import SummarizeButton from '@/components/resources/SummarizeButton';
import { ExtractedContent } from '../resources/ExtractedContent';
import { Summary } from '../resources/Summary';
import { DocumentIcon } from '@heroicons/react/24/outline';

interface Resource {
  id: number;
  title: string;
  file: string;
  file_type: string;
  description: string;
  file_size: number;
  uploaded_at: string;
  content_extracted: string;
  extraction_error: string;
  last_extracted: string;
  summary: string | null;
  last_summarized: string | null;
  project: number;
}

interface ProjectResourcesProps {
  projectId: number;
}

export default function ProjectResources({ projectId }: ProjectResourcesProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedResourceId, setExpandedResourceId] = useState<number | null>(null);

  // Fetch resources on component mount
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await api.getResources(projectId);
        setResources(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError('Failed to load resources');
      }
    };

    fetchResources();
  }, [projectId]);

  const handleUpload = async (fileOrFiles: File | File[]) => {
    setIsUploading(true);
    setError(null);

    try {
      const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
      
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('project', projectId.toString());
        formData.append('title', file.name);
        formData.append('description', `Original filename: ${file.name}`);
        formData.append('file_type', getFileType(file.name));

        await api.uploadResource(formData);
      }
      
      // Fetch updated resources after all uploads are complete
      const updatedResources = await api.getResources(projectId);
      setResources(updatedResources);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload file(s). Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'pdf':
        return 'PDF';
      case 'doc':
      case 'docx':
        return 'DOC';
      case 'txt':
        return 'TXT';
      default:
        return 'OTHER';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleExpandResource = (resourceId: number) => {
    setExpandedResourceId(expandedResourceId === resourceId ? null : resourceId);
  };

  const handleDelete = async (resourceId: number) => {
    try {
      await api.deleteResource(resourceId);
      const updatedResources = await api.getResources(projectId);
      setResources(updatedResources);
    } catch (error) {
      console.error('Error deleting resource:', error);
      setError('Failed to delete resource');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Resources</h2>
        <FileUpload onUpload={handleUpload} />
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="divide-y divide-gray-200 border border-gray-200 rounded-md shadow-sm">
        {resources.map((resource, index) => (
          <div
            key={resource.id}
            className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors duration-150 ease-in-out`}
          >
            <div 
              className="px-4 py-3 cursor-pointer transition-colors duration-150 ease-in-out"
              onClick={() => handleExpandResource(resource.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-grow min-w-0">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <DocumentIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {resource.title}
                        </h3>
                        <div className="flex items-center gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(resource.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors duration-150"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="mt-0.5 flex items-center text-xs text-gray-500">
                        <span>{new Date(resource.uploaded_at).toLocaleDateString()}</span>
                        <span className="mx-1.5">•</span>
                        <span>{formatFileSize(resource.file_size)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <svg 
                    className={`h-4 w-4 text-gray-400 transform transition-transform duration-200 ${expandedResourceId === resource.id ? 'rotate-180' : ''}`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            {expandedResourceId === resource.id && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                {/* Backdrop */}
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
                
                {/* Modal container */}
                <div className="flex min-h-full items-center justify-center p-4">
                  <div className="relative w-full max-w-6xl bg-white rounded-xl shadow-2xl">
                    {/* Header with close button */}
                    <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {resource.title}
                      </h3>
                      <button
                        onClick={() => handleExpandResource(resource.id)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Content */}
                    <div className="p-8 max-h-[calc(100vh-8rem)] overflow-y-auto">
                      <div className="space-y-4">
                        <div className="flex justify-end">
                          <a 
                            href={resource.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Download File
                          </a>
                        </div>
                        
                        {resource.file_type === 'PDF' && (
                          <>
                            <ExtractedContent
                              resourceId={resource.id}
                              projectId={projectId}
                              content={resource.content_extracted}
                              error={resource.extraction_error}
                              lastExtracted={resource.last_extracted}
                              onExtractComplete={() => {
                                const fetchResources = async () => {
                                  try {
                                    const data = await api.getResources(projectId);
                                    setResources(data);
                                    setError(null);
                                  } catch (err) {
                                    console.error('Error fetching resources:', err);
                                    setError('Failed to load resources');
                                  }
                                };
                                fetchResources();
                              }}
                            />
                            <SummarizeButton 
                              resourceId={resource.id} 
                              projectId={projectId}
                              resourceTitle={resource.title}
                              onSummarized={() => {
                                const fetchResources = async () => {
                                  try {
                                    const data = await api.getResources(projectId);
                                    setResources(data);
                                    setError(null);
                                  } catch (err) {
                                    console.error('Error fetching resources:', err);
                                    setError('Failed to load resources');
                                  }
                                };
                                fetchResources();
                              }}
                            />
                          </>
                        )}
                        
                        {resource.summary && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Summary</h4>
                            <p className="text-sm text-gray-600">{resource.summary}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {resources.length === 0 && (
          <div className="px-4 py-3 text-sm text-center text-gray-500">
            No resources yet
          </div>
        )}
      </div>
    </div>
  );
}
