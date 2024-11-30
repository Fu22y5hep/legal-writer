'use client';

import React from 'react';
import { DocumentEditor } from '../documents/DocumentEditor';
import { ChatAssistant } from '../chat/ChatAssistant';
import { ProjectNotes } from '../projects/ProjectNotes';
import { ProjectResources } from '../projects/ProjectResources';

interface RightPanelProps {
  projectId: number;
  activeSection: 'document' | 'chat' | 'notes' | 'resources';
}

export const RightPanel: React.FC<RightPanelProps> = ({ projectId, activeSection }) => {
  const renderContent = () => {
    switch (activeSection) {
      case 'document':
        return <DocumentEditor projectId={projectId} />;
      case 'chat':
        return <ChatAssistant projectId={projectId} />;
      case 'notes':
        return <ProjectNotes projectId={projectId} />;
      case 'resources':
        return <ProjectResources projectId={projectId} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full overflow-hidden">
      {renderContent()}
    </div>
  );
};
