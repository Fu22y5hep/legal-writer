'use client';

import React from 'react';
import { ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export interface Version {
  id: number;
  document_id: number;
  content: string;
  created_at: string;
  created_by: string;
  comment?: string;
}

interface VersionHistoryProps {
  versions: Version[];
  currentVersion: number;
  onRestore: (version: Version) => void;
  onClose: () => void;
  onCompare?: (version1: Version, version2: Version) => void;
}

export default function VersionHistory({
  versions,
  currentVersion,
  onRestore,
  onClose,
  onCompare,
}: VersionHistoryProps) {
  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleString();
  };

  const getTimeDifference = (date: string) => {
    const now = new Date();
    const versionDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - versionDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} days ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} months ago`;
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Version History</h2>
          <p className="mt-1 text-sm text-gray-500">
            View and restore previous versions of this document
          </p>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {versions.map((version) => (
            <div
              key={version.id}
              className={`
                p-4 border-b border-gray-200 hover:bg-gray-50
                ${version.id === currentVersion ? 'bg-blue-50' : ''}
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(version.created_at)}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      ({getTimeDifference(version.created_at)})
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {version.created_by}
                  </p>
                  {version.comment && (
                    <p className="mt-1 text-sm text-gray-600">
                      {version.comment}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {version.id !== currentVersion && (
                    <button
                      onClick={() => onRestore(version)}
                      className="flex items-center px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      <ArrowPathIcon className="h-4 w-4 mr-1" />
                      Restore
                    </button>
                  )}
                  {onCompare && version.id !== currentVersion && (
                    <button
                      onClick={() => onCompare(versions[0], version)}
                      className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-800"
                    >
                      Compare
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
