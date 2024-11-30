'use client';

import React, { useState, useEffect } from 'react';
import { TagIcon, ClockIcon } from '@heroicons/react/24/outline';

interface Note {
  id: number;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface NoteEditorProps {
  note?: Note;
  onSave: (note: Partial<Note>) => Promise<void>;
  onClose?: () => void;
}

export default function NoteEditor({ note, onSave, onClose }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  // Auto-save functionality
  useEffect(() => {
    const autoSaveTimeout = setTimeout(async () => {
      if (title || content) {
        try {
          setAutoSaveStatus('saving');
          await handleSave();
          setAutoSaveStatus('saved');
        } catch (error) {
          setAutoSaveStatus('error');
        }
      }
    }, 2000);

    return () => clearTimeout(autoSaveTimeout);
  }, [title, content]);

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      await onSave({
        id: note?.id,
        title,
        content,
        tags,
      });
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow">
      {/* Editor header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="w-full text-xl font-semibold text-gray-900 placeholder-gray-400 focus:outline-none"
        />
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {note && (
              <>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  <span>
                    Created: {new Date(note.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  <span>
                    Updated: {new Date(note.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {autoSaveStatus === 'saving' && (
              <span className="text-sm text-gray-500">Saving...</span>
            )}
            {autoSaveStatus === 'saved' && (
              <span className="text-sm text-green-600">All changes saved</span>
            )}
            {autoSaveStatus === 'error' && (
              <span className="text-sm text-red-600">Failed to save</span>
            )}
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center flex-wrap gap-2">
          <TagIcon className="h-5 w-5 text-gray-400" />
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 inline-flex items-center justify-center h-4 w-4 rounded-full hover:bg-blue-200"
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Add tag..."
            className="inline-flex items-center h-6 px-2 text-sm bg-transparent focus:outline-none focus:ring-0 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Content editor */}
      <div className="flex-1 p-6 overflow-auto">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your note..."
          className="w-full h-full resize-none focus:outline-none"
        />
      </div>
    </div>
  );
}
