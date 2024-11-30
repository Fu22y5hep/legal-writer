'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { api } from '@/lib/api';

interface Note {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  project: number;
}

interface ProjectNotesProps {
  projectId: number;
}

export default function ProjectNotes({ projectId }: ProjectNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await api.getNotes(projectId);
        setNotes(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching notes:', error);
        setError('Failed to load notes');
      }
    };

    fetchNotes();
  }, [projectId]);

  // Add new note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const addedNote = await api.createNote({
        content: newNote.trim(),
        project: projectId
      });
      setNotes(prev => [addedNote, ...prev]);
      setNewNote('');
    } catch (error) {
      console.error('Error adding note:', error);
      setError('Failed to add note');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete note
  const handleDeleteNote = async (noteId: number) => {
    try {
      await api.deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
      setError(null);
    } catch (error) {
      console.error('Error deleting note:', error);
      setError('Failed to delete note');
    }
  };

  return (
    <div className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Add Note Form */}
      <form onSubmit={handleAddNote} className="space-y-4">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Write a new note..."
          className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Adding...' : 'Add Note'}
        </button>
      </form>

      {/* Notes List */}
      <div className="space-y-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className="p-4 bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex justify-between items-start">
              <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
              <button
                onClick={() => handleDeleteNote(note.id)}
                className="ml-4 text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}
            </p>
          </div>
        ))}
        {notes.length === 0 && (
          <p className="text-center text-gray-500">No notes yet</p>
        )}
      </div>
    </div>
  );
}
