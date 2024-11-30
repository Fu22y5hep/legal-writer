'use client';

import React, { useState } from 'react';
import NoteList from '@/components/notes/NoteList';
import NoteEditor from '@/components/notes/NoteEditor';
import { MagnifyingGlassIcon, TagIcon, PlusIcon } from '@heroicons/react/24/outline';

// Mock data for development
const mockNotes = [
  {
    id: 1,
    title: 'Client Meeting Notes',
    content: 'Discussion points from meeting with ABC Corp...',
    tags: ['client', 'meeting'],
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T11:45:00Z',
  },
  {
    id: 2,
    title: 'Legal Research: Contract Law',
    content: 'Key findings on recent contract law developments...',
    tags: ['research', 'contracts'],
    created_at: '2024-01-14T15:45:00Z',
    updated_at: '2024-01-14T16:30:00Z',
  },
];

// Get all unique tags from notes
const getAllTags = (notes: typeof mockNotes) => {
  const tagSet = new Set<string>();
  notes.forEach(note => {
    note.tags.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet);
};

export default function NotesPage() {
  const [notes, setNotes] = useState(mockNotes);
  const [selectedNote, setSelectedNote] = useState<typeof mockNotes[0] | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allTags = getAllTags(notes);

  const handleCreateNote = () => {
    const newNote = {
      id: Date.now(),
      title: '',
      content: '',
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
  };

  const handleSaveNote = async (updatedNote: Partial<typeof mockNotes[0]>) => {
    try {
      // TODO: Implement actual API call
      // const savedNote = await api.saveNote(updatedNote);
      
      setNotes(prevNotes => prevNotes.map(note =>
        note.id === updatedNote.id
          ? { ...note, ...updatedNote, updated_at: new Date().toISOString() }
          : note
      ));
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      // TODO: Implement actual API call
      // await api.deleteNote(noteId);
      
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
      if (selectedNote?.id === noteId) {
        setSelectedNote(undefined);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="h-full flex">
      {/* Notes sidebar */}
      <div className="w-80 flex-none border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={handleCreateNote}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Note
          </button>

          <div className="mt-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <TagIcon className="h-4 w-4 mr-1" />
              <span>Filter by tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${selectedTags.includes(tag)
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }
                  `}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <NoteList
          notes={notes}
          selectedNoteId={selectedNote?.id}
          onSelectNote={setSelectedNote}
          onDeleteNote={handleDeleteNote}
          searchQuery={searchQuery}
          selectedTags={selectedTags}
        />
      </div>

      {/* Note editor */}
      <div className="flex-1">
        {selectedNote ? (
          <NoteEditor
            note={selectedNote}
            onSave={handleSaveNote}
            onClose={() => setSelectedNote(undefined)}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p>Select a note to view or edit</p>
              <button
                onClick={handleCreateNote}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                or create a new one
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
