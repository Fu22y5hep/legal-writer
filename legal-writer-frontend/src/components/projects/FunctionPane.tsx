'use client';

import React, { useState, useEffect } from 'react';
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

interface Project {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  }).format(new Date(date));
};

export default function FunctionPane({ className = '' }: FunctionPaneProps) {
  const router = useRouter();
  const { id } = useParams();
  const [isDeleting, setIsDeleting] = useState(false);
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await api.getProject(Number(id));
        setProject(data);
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };

    fetchProject();
  }, [id]);

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

  return (
    <div className={`${className} p-4 space-y-6`}>
      {/* Project Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-semibold text-gray-900">{project?.title}</h1>
        {project?.description && (
          <p className="mt-1 text-sm text-gray-600">{project.description}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Last edited: {project ? formatDate(project.updated_at) : ''}
        </p>
      </div>

      {/* Function Buttons */}
      <div className="space-y-2">
        <button
          onClick={() => router.push(`/projects/${id}`)}
          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
        >
          <DocumentTextIcon className="h-5 w-5 mr-3 text-gray-400" />
          Editor
        </button>

        <button
          onClick={() => router.push(`/projects/${id}/chat`)}
          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
        >
          <ChatBubbleLeftIcon className="h-5 w-5 mr-3 text-gray-400" />
          Chat Assistant
        </button>

        <button
          onClick={() => router.push(`/projects/${id}/notes`)}
          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
        >
          <PencilSquareIcon className="h-5 w-5 mr-3 text-gray-400" />
          Notes
        </button>

        <button
          onClick={() => router.push(`/projects/${id}/resources`)}
          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
        >
          <FolderIcon className="h-5 w-5 mr-3 text-gray-400" />
          Resources
        </button>

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleDuplicateProject}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
          >
            <DocumentDuplicateIcon className="h-5 w-5 mr-3 text-gray-400" />
            Duplicate Project
          </button>

          <button
            onClick={() => {/* Copy project link */}}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
          >
            <LinkIcon className="h-5 w-5 mr-3 text-gray-400" />
            Share Link
          </button>

          <button
            onClick={handleDeleteProject}
            disabled={isDeleting}
            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
          >
            <TrashIcon className="h-5 w-5 mr-3 text-red-500" />
            {isDeleting ? 'Deleting...' : 'Delete Project'}
          </button>
        </div>
      </div>
    </div>
  );
}
