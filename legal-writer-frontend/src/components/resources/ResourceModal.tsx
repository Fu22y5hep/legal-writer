import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { ExtractedContent } from './ExtractedContent';

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

interface ResourceModalProps {
  resource: Resource | null;
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
  onExtractComplete?: () => void;
}

export default function ResourceModal({
  resource,
  projectId,
  isOpen,
  onClose,
  onExtractComplete,
}: ResourceModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  if (!resource) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

      {/* Full-screen container */}
      <div className="fixed inset-0 w-screen overflow-y-auto">
        {/* Container to center the panel */}
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-6xl rounded-xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
              <div className="flex-1">
                <Dialog.Title className="text-lg font-semibold text-gray-900">
                  {resource.title}
                </Dialog.Title>
                {resource.description && (
                  <Dialog.Description className="mt-1 text-sm text-gray-500">
                    {resource.description}
                  </Dialog.Description>
                )}
              </div>
              
              {/* Search input */}
              <div className="flex-1 mx-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search in content..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <button
                onClick={onClose}
                className="flex-none text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <ExtractedContent
                resourceId={resource.id}
                projectId={projectId}
                content={resource.content_extracted}
                error={resource.extraction_error}
                lastExtracted={resource.last_extracted}
                onExtractComplete={onExtractComplete}
                searchQuery={searchQuery}
              />
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}
