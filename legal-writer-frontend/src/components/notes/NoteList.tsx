'use client';

import React from 'react';
import { TagIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/outline';

interface Note {
  id: number;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface NoteListProps {
  notes: Note[];
  selectedNoteId?: number;
  onSelectNote: (note: Note) => void;
  onDeleteNote: (noteId: number) => void;
  searchQuery: string;
  selectedTags: string[];
}

export default function NoteList({
  notes,
  selectedNoteId,
  onSelectNote,
  onDeleteNote,
  searchQuery,
  selectedTags,
}: NoteListProps) {
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchQuery
      ? note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesTags = selectedTags.length
      ? selectedTags.every(tag => note.tags.includes(tag))
      : true;

    return matchesSearch && matchesTags;
  });

  const getPreviewText = (content: string) => {
    return content.length > 150
      ? content.substring(0, 150) + '...'
      : content;
  };

  return (
    <div className="divide-y divide-gray-200">
      {filteredNotes.map((note) => (
        <div
          key={note.id}
          className={`
            p-4 cursor-pointer transition-colors
            ${selectedNoteId === note.id
              ? 'bg-blue-50'
              : 'hover:bg-gray-50'
            }
          `}
          onClick={() => onSelectNote(note)}
        >
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium text-gray-900">
              {note.title || 'Untitled Note'}
            </h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteNote(note.id);
              }}
              className="text-gray-400 hover:text-red-600"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>

          <p className="mt-1 text-sm text-gray-600">
            {getPreviewText(note.content)}
          </p>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TagIcon className="h-4 w-4 text-gray-400" />
              <div className="flex gap-1">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>
                {new Date(note.updated_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      ))}

      {filteredNotes.length === 0 && (
        <div className="p-4 text-center text-gray-500">
          No notes found
        </div>
      )}
    </div>
  );
}
