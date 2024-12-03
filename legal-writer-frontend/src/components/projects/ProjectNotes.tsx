'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { EditNoteModal } from '../common/EditNoteModal';
import { PencilIcon, TrashIcon, ChevronDownIcon, DocumentIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import './ProjectNotes.css';

interface Note {
  id: number;
  content: string;
  title: string;
  name_identifier: string;
  created_at: string;
  updated_at: string;
  project: number;
  project_name?: string;
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
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [expandedNoteId, setExpandedNoteId] = useState<number | null>(null);
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set([projectId]));

  // Group notes by project and sort by date
  const groupedNotes = useMemo(() => {
    const groups: { [key: number]: Note[] } = {};
    notes.forEach(note => {
      if (!groups[note.project]) {
        groups[note.project] = [];
      }
      groups[note.project].push(note);
    });

    // Sort notes within each project by creation date (newest first)
    Object.values(groups).forEach(projectNotes => {
      projectNotes.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    return groups;
  }, [notes]);

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

      setNotes(prevNotes => [addedNote, ...prevNotes]);
      setNewNote('');
      setNewNoteTitle('');
      setError(null);
      setIsNewNoteModalOpen(false);
      toast.success('Note created successfully');
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEdit = async (noteId: number, title: string, content: string) => {
    try {
      const updatedNote = await api.updateNote(noteId, {
        title,
        name_identifier: title,
        content,
      });
      
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === noteId ? { 
            ...note, 
            title, 
            name_identifier: title,
            content,
            updated_at: new Date().toISOString(),
          } : note
        )
      );
      
      setEditingNote(null);
      toast.success('Note updated successfully');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await api.deleteNote(noteId);
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const toggleProjectExpanded = (projectId: number) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
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
            {Object.entries(groupedNotes).map(([projectId, projectNotes]) => (
              <div key={projectId} className="bg-white">
                <div
                  className="px-4 py-3 flex items-center cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleProjectExpanded(Number(projectId))}
                >
                  {expandedProjects.has(Number(projectId)) ? (
                    <ChevronDownIcon className="h-5 w-5 text-gray-400 mr-2" />
                  ) : (
                    <ChevronRightIcon className="h-5 w-5 text-gray-400 mr-2" />
                  )}
                  <h3 className="text-sm font-medium text-gray-900">
                    {projectNotes[0]?.project_name || `Project ${projectId}`}
                  </h3>
                  <span className="ml-2 text-sm text-gray-500">
                    ({projectNotes.length} {projectNotes.length === 1 ? 'note' : 'notes'})
                  </span>
                </div>
                
                {expandedProjects.has(Number(projectId)) && projectNotes.map((note, index) => (
                  <div
                    key={note.id}
                    className={`pl-8 pr-4 py-3 ${index < projectNotes.length - 1 ? 'border-b border-gray-200' : ''} hover:bg-gray-50`}
                  >
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex items-center space-x-3 cursor-pointer flex-grow"
                        onClick={() => setExpandedNoteId(expandedNoteId === note.id ? null : note.id)}
                      >
                        <DocumentIcon className="h-5 w-5 text-gray-400" />
                        <p className="truncate text-sm font-medium text-indigo-600">{note.title}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <time className="text-sm text-gray-500">
                          {format(new Date(note.updated_at || note.created_at), 'MMM d, yyyy')}
                        </time>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingNote(note)}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                          <ChevronDownIcon 
                            className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${
                              expandedNoteId === note.id ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                    {expandedNoteId === note.id && (
                      <div className="mt-2 border-t pt-2">
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                          {note.content}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
            {notes.length === 0 && (
              <div className="text-center py-12">
                <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No notes</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new note.</p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setIsNewNoteModalOpen(true)}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    <PencilIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                    New Note
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Note Modal */}
      <EditNoteModal
        isOpen={editingNote !== null}
        note={editingNote}
        onClose={() => setEditingNote(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
