'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface Note {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectNotesProps {
  projectId: number;
}

export default function ProjectNotes({ projectId }: ProjectNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/notes`);
        if (response.ok) {
          const data = await response.json();
          setNotes(data);
        }
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };

    fetchNotes();
  }, [projectId]);

  // Add new note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newNote }),
      });

      if (response.ok) {
        const addedNote = await response.json();
        setNotes(prev => [addedNote, ...prev]);
        setNewNote('');
      }
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete note
  const handleDeleteNote = async (noteId: number) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotes(prev => prev.filter(note => note.id !== noteId));
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <div className="space-y-6">
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
            className="bg-white p-4 rounded-lg border shadow-sm space-y-2"
          >
            <div className="flex justify-between items-start">
              <p className="whitespace-pre-wrap">{note.content}</p>
              <button
                onClick={() => handleDeleteNote(note.id)}
                className="text-red-500 hover:text-red-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500">
              {format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
