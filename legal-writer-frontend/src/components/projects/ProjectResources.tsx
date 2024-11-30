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
        formData.append('title', file.name.split('[')[0].trim().substring(0, 200));
        formData.append('description', `Original filename: ${file.name}`);
        formData.append('file_type', getFileType(file.name));

        const updatedResources = await api.uploadResource(formData);
        if (Array.isArray(updatedResources)) {
          setResources(updatedResources);
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

  const toggleResource = (resourceId: number) => {
    setExpandedResourceId(expandedResourceId === resourceId ? null : resourceId);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Resources</h2>
        <FileUpload onUpload={handleUpload} />
      </div>

      {isUploading && (
        <div className="animate-pulse p-4 border rounded-lg">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      )}

      <div className="space-y-2">
        {resources.map((resource) => (
          <div key={resource.id} className="border rounded-lg overflow-hidden">
            <div 
              onClick={() => toggleResource(resource.id)}
              className="p-4 bg-white hover:bg-gray-50 cursor-pointer flex justify-between items-center"
            >
              <div>
                <h3 className="font-medium">{resource.title}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(resource.uploaded_at).toLocaleDateString()}
                </p>
              </div>
              <span className="text-sm text-gray-500">{resource.file_type}</span>
            </div>

            {expandedResourceId === resource.id && (
              <div className="p-4 bg-gray-50 border-t">
                <div className="flex justify-end mb-4">
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
                  <ExtractedContent
                    resourceId={resource.id}
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
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {resources.length === 0 && !isUploading && (
        <div className="text-center py-12 text-gray-500">
          No resources uploaded yet
        </div>
      )}
    </div>
  );
}
