'use client';

import React, { useState } from 'react';
import { DocumentIcon, ArrowDownTrayIcon, DocumentTextIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import ResourceModal from './ResourceModal';

interface Resource {
  id: number;
  title: string;
  description?: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  content_extracted?: string;
  extraction_error?: string;
  last_extracted?: string;
}

interface ResourceListProps {
  resources: Resource[];
  projectId: number;
  onDownload: (id: number) => void;
  onExtract: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function ResourceList({
  resources,
  projectId,
  onDownload,
  onExtract,
  onDelete,
}: ResourceListProps) {
  const [sortField, setSortField] = useState<keyof Resource>('uploaded_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  // Sort and filter resources
  const sortedResources = [...resources]
    .filter(resource => 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortDirection === 'asc') {
        return a[sortField] > b[sortField] ? 1 : -1;
      }
      return a[sortField] < b[sortField] ? 1 : -1;
    });

  const handleSort = (field: keyof Resource) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleResourceClick = (resource: Resource) => {
    setSelectedResource(resource);
  };

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Resources Table */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                onClick={() => handleSort('title')}
              >
                <div className="group inline-flex">
                  Title
                  <span className="ml-2 flex-none rounded text-gray-400">
                    {sortField === 'title' ? (
                      sortDirection === 'desc' ? (
                        <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <ChevronUpIcon className="h-5 w-5" aria-hidden="true" />
                      )
                    ) : null}
                  </span>
                </div>
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Type
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Size
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                onClick={() => handleSort('uploaded_at')}
              >
                <div className="group inline-flex">
                  Date Added
                  <span className="ml-2 flex-none rounded text-gray-400">
                    {sortField === 'uploaded_at' ? (
                      sortDirection === 'desc' ? (
                        <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <ChevronUpIcon className="h-5 w-5" aria-hidden="true" />
                      )
                    ) : null}
                  </span>
                </div>
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {sortedResources.map((resource) => (
              <tr key={resource.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-3 py-4">
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => handleResourceClick(resource)}
                  >
                    {resource.file_type === 'PDF' ? (
                      <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                    ) : (
                      <DocumentIcon className="h-5 w-5 text-gray-400 mr-2" />
                    )}
                    <div>
                      <div className="font-medium text-gray-900 hover:text-indigo-600">
                        {resource.title}
                      </div>
                      {resource.description && (
                        <div className="text-sm text-gray-500">
                          {resource.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {resource.file_type}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {formatFileSize(resource.file_size)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {new Date(resource.uploaded_at).toLocaleDateString()}
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <button
                    className="text-gray-400 hover:text-gray-500 mr-2"
                    onClick={() => onDownload(resource.id)}
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                  </button>
                  <button
                    className="text-gray-400 hover:text-gray-500 mr-2"
                    onClick={() => onExtract(resource.id)}
                  >
                    <DocumentTextIcon className="h-5 w-5" />
                  </button>
                  <button
                    className="text-gray-400 hover:text-red-500"
                    onClick={() => onDelete(resource.id)}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resource Modal */}
      <ResourceModal
        resource={selectedResource}
        projectId={projectId}
        isOpen={!!selectedResource}
        onClose={() => setSelectedResource(null)}
        onExtractComplete={() => {
          onExtract(selectedResource?.id || 0);
          setSelectedResource(null);
        }}
      />
    </div>
  );
}
