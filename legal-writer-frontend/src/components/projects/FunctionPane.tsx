import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import {
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
  PencilSquareIcon,
  FolderIcon,
  LinkIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import type { TabType } from '@/app/projects/[id]/page';

interface Project {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface FunctionPaneProps {
  className?: string;
}

export default function FunctionPane({ className = '' }: FunctionPaneProps) {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') as TabType || 'editor';
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await api.getProject(Number(id));
        setProject(data);
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleTabChange = (tab: TabType) => {
    router.push(`/projects/${id}?tab=${tab}`);
  };

  return (
    <div className={`w-64 h-full flex flex-col bg-white border-r border-gray-200 ${className}`}>
      {/* Project Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-900 truncate">{project?.title}</h2>
        {project?.description && (
          <p className="mt-1 text-xs text-gray-600 line-clamp-2">{project.description}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Last edited: {project ? formatDate(project.updated_at) : ''}
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex-1 py-2">
        <button
          onClick={() => handleTabChange('editor')}
          className={`w-full flex items-center px-3 py-2 text-sm ${
            currentTab === 'editor'
              ? 'text-blue-600 bg-blue-50'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <DocumentTextIcon className="h-5 w-5 mr-3" />
          Editor
        </button>
        <button
          onClick={() => handleTabChange('chat')}
          className={`w-full flex items-center px-3 py-2 text-sm ${
            currentTab === 'chat'
              ? 'text-blue-600 bg-blue-50'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <ChatBubbleLeftIcon className="h-5 w-5 mr-3" />
          Chat Assistant
        </button>
        <button
          onClick={() => handleTabChange('notes')}
          className={`w-full flex items-center px-3 py-2 text-sm ${
            currentTab === 'notes'
              ? 'text-blue-600 bg-blue-50'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <PencilSquareIcon className="h-5 w-5 mr-3" />
          Notes
        </button>
        <button
          onClick={() => handleTabChange('resources')}
          className={`w-full flex items-center px-3 py-2 text-sm ${
            currentTab === 'resources'
              ? 'text-blue-600 bg-blue-50'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <FolderIcon className="h-5 w-5 mr-3" />
          Resources
        </button>
      </div>

      {/* Project Actions */}
      <div className="py-2 border-t border-gray-200">
        <button
          onClick={() => {/* TODO: Implement duplicate */}}
          className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          <DocumentDuplicateIcon className="h-5 w-5 mr-3" />
          Duplicate Project
        </button>
        <button
          onClick={() => {/* TODO: Implement share */}}
          className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          <LinkIcon className="h-5 w-5 mr-3" />
          Share Link
        </button>
        <button
          onClick={() => {/* TODO: Implement delete */}}
          className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          <TrashIcon className="h-5 w-5 mr-3" />
          Delete Project
        </button>
      </div>
    </div>
  );
}
