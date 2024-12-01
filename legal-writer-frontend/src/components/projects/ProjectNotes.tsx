'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface Note {
  id: number;
  content: string;
  title: string;
  name_identifier: string;
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
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [expandedNoteId, setExpandedNoteId] = useState<number | null>(null);
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false);

  // Fetch notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await api.getNotes(projectId);
        console.log('Fetched notes data:', data);
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
    if (!newNote.trim() || !newNoteTitle.trim()) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const addedNote = await api.createNote({
        content: newNote.trim(),
        title: newNoteTitle.trim(),
        name_identifier: newNoteTitle.trim(),
        project: projectId,
      });

      setNotes(prevNotes => [...prevNotes, addedNote]);
      setNewNote('');
      setNewNoteTitle('');
      setError(null);
      setIsNewNoteModalOpen(false);
    } catch (error) {
      console.error('Error adding note:', error);
      setError('Failed to add note');
    } finally {
      setIsLoading(false);
    }
  };

  // Start editing note
  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditTitle(note.title || note.name_identifier || '');
  };

  // Save note edit
  const handleSaveEdit = async (noteId: number) => {
    try {
      const updatedNote = await api.updateNote(noteId, {
        title: editTitle,
        name_identifier: editTitle,
      });
      
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === noteId ? { ...note, title: editTitle, name_identifier: editTitle } : note
        )
      );
      
      setEditingNoteId(null);
      setEditTitle('');
      toast.success('Note updated successfully');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditTitle('');
  };

  // Delete note
  const handleDeleteNote = async (noteId: number) => {
    try {
      await api.deleteNote(noteId);
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
      setError(null);
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Notes</h2>
        <button
          onClick={() => setIsNewNoteModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Note
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* New Note Modal */}
      {isNewNoteModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Add New Note</h3>
            </div>
            <form onSubmit={handleAddNote} className="p-6 space-y-4">
              <div>
                <label htmlFor="noteTitle" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  id="noteTitle"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter note title"
                />
              </div>
              <div>
                <label htmlFor="noteContent" className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <textarea
                  id="noteContent"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={6}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter note content"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewNoteModalOpen(false);
                    setNewNote('');
                    setNewNoteTitle('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !newNote.trim() || !newNoteTitle.trim()}
                  className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                >
                  {isLoading ? 'Adding...' : 'Add Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg divide-y">
        {notes.map(note => (
          <div key={note.id} className="group">
            <div 
              className="p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => setExpandedNoteId(expandedNoteId === note.id ? null : note.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-grow">
                  {editingNoteId === note.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg"
                        placeholder="Enter note title"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveEdit(note.id);
                        }}
                        className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelEdit();
                        }}
                        className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-grow">
                        <h4 className="text-lg font-medium text-gray-900">
                          {note.title || note.name_identifier || 'Untitled Note'}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {format(new Date(note.created_at), 'PPP')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(note);
                          }}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 text-sm font-medium flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note.id);
                          }}
                          className="px-3 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 text-sm font-medium flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <svg 
                    className={`h-5 w-5 text-gray-400 transform transition-transform ${expandedNoteId === note.id ? 'rotate-180' : ''}`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            {expandedNoteId === note.id && (
              <div className="px-4 pb-4 text-sm text-gray-900 whitespace-pre-wrap border-t border-gray-100">
                {note.content}
              </div>
            )}
          </div>
        ))}
        {notes.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No notes yet
          </div>
        )}
      </div>
    </div>
  );
}
