'use client';

import React, { useState } from 'react';
import {
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
  PencilSquareIcon,
  FolderIcon,
  LinkIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface FunctionPaneProps {
  className?: string;
}

export default function FunctionPane({ className = '' }: FunctionPaneProps) {
  const router = useRouter();
  const { id } = useParams();
  const [isDeleting, setIsDeleting] = useState(false);

  // Debug logging
  console.log('FunctionPane params:', { id });

  const handleDuplicateProject = async () => {
    try {
      const duplicatedProject = await api.duplicateProject(Number(id));
      router.push(`/projects/${duplicatedProject.id}`);
    } catch (error) {
      console.error('Error duplicating project:', error);
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    try {
      setIsDeleting(true);
      await api.deleteProject(Number(id));
      router.push('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      setIsDeleting(false);
    }
  };

  const functionButtons = [
    {
      icon: DocumentTextIcon,
      label: 'Documents',
      onClick: () => {},
      description: 'View and edit project documents',
    },
    {
      icon: ChatBubbleLeftIcon,
      label: 'Chat',
      onClick: () => {},
      description: 'Chat with AI assistant',
    },
    {
      icon: PencilSquareIcon,
      label: 'Notes',
      onClick: () => {},
      description: 'Manage project notes',
    },
    {
      icon: FolderIcon,
      label: 'Resources',
      onClick: () => {},
      description: 'Access project resources',
    },
    {
      icon: DocumentDuplicateIcon,
      label: 'Duplicate',
      onClick: handleDuplicateProject,
      description: 'Create a copy of this project',
    },
    {
      icon: LinkIcon,
      label: 'Share',
      onClick: () => {},
      description: 'Share project with others',
    },
    {
      icon: TrashIcon,
      label: 'Delete',
      onClick: handleDeleteProject,
      description: 'Delete this project',
      className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
      disabled: isDeleting,
    },
  ];

  return (
    <div className={`py-6 ${className}`}>
      <div className="px-4">
        <h2 className="text-lg font-semibold text-gray-900">Project Functions</h2>
        <p className="mt-1 text-sm text-gray-500">Access project tools and actions</p>
      </div>
      <div className="mt-6 px-3">
        {functionButtons.map((button) => (
          <button
            key={button.label}
            onClick={button.onClick}
            disabled={button.disabled}
            className={`
              w-full flex items-center space-x-3 px-3 py-2 my-1 rounded-lg
              text-left text-sm font-medium
              ${button.className || 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}
              ${button.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <button.icon className="h-5 w-5 flex-shrink-0" />
            <div>
              <div>{button.label}</div>
              <div className="text-xs font-normal text-gray-500">{button.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
