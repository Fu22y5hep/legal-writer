'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ClockIcon,
  DocumentDuplicateIcon,
  ClockIcon as HistoryIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';

interface DocumentHeaderProps {
  title: string;
  createdAt: string;
  updatedAt: string;
  onTitleChange: (newTitle: string) => void;
  onDuplicate?: () => void;
  onShowHistory?: () => void;
  onShare?: () => void;
  isSaving?: boolean;
}

export default function DocumentHeader({
  title,
  createdAt,
  updatedAt,
  onTitleChange,
  onDuplicate,
  onShowHistory,
  onShare,
  isSaving = false,
}: DocumentHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditing]);

  const handleTitleSubmit = () => {
    if (editedTitle.trim()) {
      onTitleChange(editedTitle.trim());
    } else {
      setEditedTitle(title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setEditedTitle(title);
      setIsEditing(false);
    }
  };

  return (
    <div className="px-6 py-4 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              ref={titleInputRef}
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={handleKeyDown}
              className="w-full text-xl font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
            />
          ) : (
            <h1
              onClick={() => setIsEditing(true)}
              className="text-xl font-semibold text-gray-900 cursor-pointer hover:bg-gray-50 rounded px-2 py-1"
            >
              {title}
            </h1>
          )}
          <div className="mt-1 flex items-center text-sm text-gray-500 space-x-4">
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>Created: {new Date(createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>Updated: {new Date(updatedAt).toLocaleDateString()}</span>
            </div>
            {isSaving && (
              <span className="text-blue-600">Saving...</span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onShowHistory && (
            <button
              onClick={onShowHistory}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              title="Version History"
            >
              <HistoryIcon className="h-5 w-5" />
            </button>
          )}
          {onShare && (
            <button
              onClick={onShare}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              title="Share Document"
            >
              <ShareIcon className="h-5 w-5" />
            </button>
          )}
          {onDuplicate && (
            <button
              onClick={onDuplicate}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              title="Duplicate Document"
            >
              <DocumentDuplicateIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
