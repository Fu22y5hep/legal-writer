'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import './ProjectNotes.css'; // Import CSS for styling

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
  const [editContent, setEditContent] = useState('');
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
    setEditContent(note.content || '');
  };

  // Save note edit
  const handleSaveEdit = async (noteId: number) => {
    try {
      const updatedNote = await api.updateNote(noteId, {
        title: editTitle,
        name_identifier: editTitle,
        content: editContent,
      });
      
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === noteId ? { 
            ...note, 
            title: editTitle, 
            name_identifier: editTitle,
            content: editContent 
          } : note
        )
      );
      
      setEditingNoteId(null);
      setEditTitle('');
      setEditContent('');
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
    setEditContent('');
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
    <div className="w-full max-w-7xl mx-auto">
      <div className="bg-white">
        <div className="px-4 py-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-semibold leading-7 text-gray-900">Notes</h2>
            <button
              onClick={() => setIsNewNoteModalOpen(true)}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Add Note
            </button>
          </div>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <div className="divide-y divide-gray-200 border border-gray-200 rounded-md shadow-sm">
            {notes.map((note, index) => (
              <div
                key={note.id}
                className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors duration-150 ease-in-out`}
              >
                <div 
                  className="px-4 py-4 sm:px-6 cursor-pointer"
                  onClick={() => setExpandedNoteId(expandedNoteId === note.id ? null : note.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="truncate text-sm font-medium text-indigo-600">{note.title}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <time className="text-sm text-gray-500">
                        {format(new Date(note.created_at), 'MMM d, yyyy')}
                      </time>
                      <svg 
                        className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${expandedNoteId === note.id ? 'rotate-180' : ''}`}
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  {expandedNoteId === note.id && (
                    <div className="mt-2 border-t pt-2">
                      <div className="text-sm text-gray-700">
                        {note.content}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {notes.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No notes</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new note.</p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setIsNewNoteModalOpen(true)}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                    New Note
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* New Note Modal */}
          {isNewNoteModalOpen && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
              <div className="fixed inset-0 z-10 overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                  <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                    <div>
                      <div className="mt-3 text-center sm:mt-5">
                        <h3 className="text-base font-semibold leading-6 text-gray-900">
                          Create New Note
                        </h3>
                        <div className="mt-2">
                          <input
                            type="text"
                            value={newNoteTitle}
                            onChange={(e) => setNewNoteTitle(e.target.value)}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="Note Title"
                          />
                          <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            rows={4}
                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="Note Content"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                        onClick={handleAddNote}
                      >
                        Create
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                        onClick={() => setIsNewNoteModalOpen(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
