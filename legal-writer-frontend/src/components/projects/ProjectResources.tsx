'use client';

import { useState, useEffect } from 'react';
import FileUpload from '../upload/FileUpload';
import { api } from '@/lib/api';
import { ExtractedContent } from '../resources/ExtractedContent';

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
  project: number;
}

interface ProjectResourcesProps {
  projectId: number;
}

export const ProjectResources: React.FC<ProjectResourcesProps> = ({ projectId }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);
    setError(null);

    try {
      for (const file of files) {
        // Create a shorter title while preserving the original name in description
        const originalName = file.name;
        const shortTitle = originalName
          .split('[')[0]  // Take the part before any brackets
          .trim()
          .substring(0, 200);  // Increased to 200 chars since backend now supports up to 255

        console.log('Uploading file:', {
          originalName,
          shortTitle,
          size: file.size,
          type: file.type
        });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', shortTitle);
        formData.append('project', projectId.toString());
        formData.append('file_type', getFileType(file.name));
        formData.append('description', `Original filename: ${originalName}`); // Store full original name with a prefix

        try {
          const newResource = await api.uploadResource(formData);
          console.log('Upload response:', newResource);
          setResources(prev => [...prev, newResource]);
        } catch (uploadError: any) {
          console.error('Detailed upload error:', {
            error: uploadError,
            message: uploadError.message,
            response: uploadError.response,
          });
          throw uploadError;
        }
      }
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

  const getResources = async () => {
    try {
      const data = await api.getResources(projectId);
      setResources(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Failed to load resources');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-lg font-medium text-gray-900">Project Resources</h2>
        <p className="mt-1 text-sm text-gray-500">
          Upload documents related to this project.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <FileUpload onUpload={handleUpload} />

      {isUploading && (
        <div className="mt-4">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {resources.length > 0 ? (
        <div className="mt-6">
          <div className="divide-y divide-gray-200">
            {resources.map((resource) => (
              <div key={resource.id} className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <svg
                      className="h-8 w-8 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{resource.title}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(resource.file_size)} • {resource.file_type} •{' '}
                        {new Date(resource.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <a
                    href={resource.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Download
                  </a>
                </div>

                {/* Description */}
                {resource.description && (
                  <p className="text-sm text-gray-700 mt-2">{resource.description}</p>
                )}

                {/* Show extracted content for PDFs */}
                {resource.file_type === 'PDF' && (
                  <div className="mt-2">
                    <ExtractedContent
                      resourceId={resource.id}
                      content={resource.content_extracted}
                      error={resource.extraction_error}
                      lastExtracted={resource.last_extracted}
                      onExtractComplete={getResources}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-4">No resources uploaded yet</p>
      )}
    </div>
  );
}
