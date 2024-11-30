import React, { useState } from 'react';
import { ProjectResources } from '../projects/ProjectResources';
import { ProjectNotes } from '../projects/ProjectNotes';
import DocumentEditor from '../documents/DocumentEditor';

interface RightPanelProps {
  projectId: number;
}

type TabType = 'editor' | 'chat' | 'notes' | 'resources';

export const RightPanel: React.FC<RightPanelProps> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState<TabType>('editor');

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { 
      id: 'editor', 
      label: 'Editor',
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
    },
    { 
      id: 'chat', 
      label: 'Chat',
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
    },
    { 
      id: 'notes', 
      label: 'Notes',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    },
    { 
      id: 'resources', 
      label: 'Resources',
      icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
    }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group relative min-w-0 flex-1 overflow-hidden py-4 px-4 text-sm font-medium text-center
                hover:bg-gray-50 focus:z-10 focus:outline-none
                ${activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 border-b-2 border-transparent hover:text-gray-700'
                }
              `}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              <div className="flex items-center justify-center">
                <svg 
                  className="w-5 h-5 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d={tab.icon} 
                  />
                </svg>
                {tab.label}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'editor' && (
          <div className="h-full">
            <DocumentEditor projectId={projectId} />
          </div>
        )}
        
        {activeTab === 'chat' && (
          <div className="p-4">
            <div className="text-gray-500 text-center py-8">
              Chat functionality coming soon...
            </div>
          </div>
        )}
        
        {activeTab === 'notes' && (
          <div className="p-4">
            <ProjectNotes projectId={projectId} />
          </div>
        )}
        
        {activeTab === 'resources' && (
          <div className="p-4">
            <ProjectResources projectId={projectId} />
          </div>
        )}
      </div>
    </div>
  );
};
