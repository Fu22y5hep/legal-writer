'use client';

import { useState } from 'react';
import FileUpload from '../upload/FileUpload';

interface Resource {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  url: string;
}

interface ProjectResourcesProps {
  projectId: number;
}

export default function ProjectResources({ projectId }: ProjectResourcesProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectId', projectId.toString());

        const response = await fetch('/api/projects/resources/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const newResource = await response.json();
        setResources(prev => [...prev, newResource]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-lg font-medium text-gray-900">Project Resources</h2>
        <p className="mt-1 text-sm text-gray-500">
          Upload PDF documents related to this project.
        </p>
      </div>

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

      {resources.length > 0 && (
        <div className="mt-6">
          <ul className="divide-y divide-gray-200">
            {resources.map((resource) => (
              <li key={resource.id} className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
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
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{resource.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(resource.size)} • Uploaded{' '}
                        {new Date(resource.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <a
                    href={resource.url}
                    download
                    className="ml-6 text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Download
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
