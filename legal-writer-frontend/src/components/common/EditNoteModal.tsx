import React, { useState, useEffect } from 'react';

interface EditNoteModalProps {
  isOpen: boolean;
  note: {
    id: number;
    title: string;
    content: string;
  } | null;
  onClose: () => void;
  onSave: (noteId: number, title: string, content: string) => void;
}

export const EditNoteModal: React.FC<EditNoteModalProps> = ({
  isOpen,
  note,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  if (!isOpen || !note) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onSave(note.id, title.trim(), content.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="w-full">
                <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">
                  Edit Note
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="note-title" className="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      id="note-title"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter note title"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label htmlFor="note-content" className="block text-sm font-medium text-gray-700">
                      Content
                    </label>
                    <textarea
                      id="note-content"
                      rows={8}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Enter note content"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="submit"
                disabled={!title.trim() || !content.trim()}
                className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-blue-300 sm:ml-3 sm:w-auto"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
