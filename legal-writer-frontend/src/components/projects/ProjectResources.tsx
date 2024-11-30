'use client';

import React, { useState } from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

interface ProjectResourcesProps {
  projectId: number;
}

interface Resource {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: Date;
}

const ProjectResources: React.FC<ProjectResourcesProps> = ({ projectId }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    // TODO: Implement file upload logic
    console.log('Files to upload:', files);
  };

  return (
    <div className="h-full flex flex-col p-4">
      <h2 className="text-lg font-semibold mb-4">Project Resources</h2>
      
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          flex flex-col items-center justify-center p-8 mb-4
          border-2 border-dashed rounded-lg
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          transition-colors duration-200
        `}
      >
        <DocumentTextIcon className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-sm text-gray-600">
          Drag and drop files here or{' '}
          <button className="text-blue-600 hover:text-blue-700">browse</button>
        </p>
        <p className="text-xs text-gray-500 mt-2">PDF files only (max 10MB)</p>
      </div>

      {/* Resources List */}
      <div className="flex-1 overflow-y-auto">
        {resources.length > 0 ? (
          <ul className="space-y-2">
            {resources.map((resource) => (
              <li
                key={resource.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
              >
                <div className="flex items-center">
                  <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{resource.name}</p>
                    <p className="text-xs text-gray-500">
                      {resource.size} • {resource.uploadedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  Download
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No resources uploaded yet
          </div>
        )}
      </div>
    </div>
  );
};

export { ProjectResources };
