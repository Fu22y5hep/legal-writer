'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import ResourceUpload from '@/components/resources/ResourceUpload';
import ResourceList from '@/components/resources/ResourceList';

interface Resource {
  id: number;
  title: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  description: string;
  content_extracted?: string;
  extraction_error?: string;
  last_extracted?: string;
}

// Mock data for development
const mockResources: Resource[] = [
  {
    id: 1,
    title: 'Contract Template.docx',
    file_type: 'DOCX',
    file_size: 1024 * 1024 * 2.5, // 2.5MB
    uploaded_at: '2024-01-15T10:30:00Z',
    description: 'Standard contract template for client agreements',
  },
  {
    id: 2,
    title: 'Legal Research.pdf',
    file_type: 'PDF',
    file_size: 1024 * 1024 * 5.7, // 5.7MB
    uploaded_at: '2024-01-14T15:45:00Z',
    description: 'Research document on recent case law',
    content_extracted: '# Legal Research Document\n\n## Introduction\nThis document contains important legal research findings...\n\n## Key Points\n- Point 1\n- Point 2\n- Point 3\n\n## Conclusion\nBased on the research...',
  },
];

export default function ResourcesPage() {
  const params = useParams();
  const projectId = Number(params.id) || 0;
  const [resources, setResources] = useState<Resource[]>(mockResources);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);
    try {
      // TODO: Implement actual file upload to backend
      // const uploadedFiles = await Promise.all(
      //   files.map(file => api.uploadResource(file))
      // );

      // Mock upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock new resources
      const newResources = files.map((file, index) => ({
        id: Date.now() + index,
        title: file.name,
        file_type: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
        file_size: file.size,
        uploaded_at: new Date().toISOString(),
        description: '', // Ensure description is always present
      }));

      setResources(prev => [...prev, ...newResources]);
    } catch (error) {
      console.error('Failed to upload files:', error);
      // TODO: Show error notification
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      // TODO: Implement actual delete on backend
      // await api.deleteResource(id);
      setResources(prev => prev.filter(resource => resource.id !== id));
    } catch (error) {
      console.error('Failed to delete resource:', error);
      // TODO: Show error notification
    }
  };

  const handleDownload = async (id: number) => {
    try {
      // TODO: Implement actual download from backend
      // const url = await api.getResourceDownloadUrl(id);
      // window.open(url, '_blank');
      console.log('Downloading resource:', id);
    } catch (error) {
      console.error('Failed to download resource:', error);
      // TODO: Show error notification
    }
  };

  const handleExtract = async (id: number) => {
    try {
      // TODO: Implement text extraction and analysis
      // const analysis = await api.analyzeResource(id);
      console.log('Extracting text from resource:', id);
      
      // Mock extraction response
      setResources(prev => prev.map(resource => {
        if (resource.id === id) {
          return {
            ...resource,
            content_extracted: '# Extracted Content\n\n## Section 1\nThis is some extracted content from the document...\n\n## Section 2\n- Point 1\n- Point 2\n\n## Conclusion\nFinal thoughts...',
            last_extracted: new Date().toISOString(),
          };
        }
        return resource;
      }));
    } catch (error) {
      console.error('Failed to analyze resource:', error);
      // TODO: Show error notification
    }
  };

  return (
    <div className="h-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Resources</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload and manage your legal documents and resources
        </p>
      </div>

      <ResourceUpload onUpload={handleUpload} isUploading={isUploading} />

      <ResourceList
        resources={resources}
        projectId={projectId}
        onDelete={handleDelete}
        onDownload={handleDownload}
        onExtract={handleExtract}
      />
    </div>
  );
}
