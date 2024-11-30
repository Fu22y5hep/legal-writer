'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { RightPanel } from '@/components/panels/RightPanel';
import { DocumentTextIcon, ChatBubbleLeftIcon, BookmarkIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

interface Project {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

type TabType = 'document' | 'chat' | 'notes' | 'resources';

export default function ProjectPage() {
  const params = useParams();
  const projectId = Number(params.id);
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('document');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const data = await api.getProject(projectId);
      setProject(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching project:', err);
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'document', label: 'Document', icon: DocumentTextIcon },
    { id: 'chat', label: 'Chat', icon: ChatBubbleLeftIcon },
    { id: 'notes', label: 'Notes', icon: BookmarkIcon },
    { id: 'resources', label: 'Resources', icon: DocumentTextIcon },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500">Loading project...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Project Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {project?.title}
            </h2>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Cog6ToothIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
            {project?.description}
          </p>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`
                w-full flex items-center px-4 py-3 text-sm
                ${activeTab === tab.id
                  ? 'bg-gray-100 text-blue-600 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              <tab.icon className="h-5 w-5 mr-3" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <RightPanel projectId={projectId} activeSection={activeTab} />
        </div>
      </div>
    </div>
  );
}
