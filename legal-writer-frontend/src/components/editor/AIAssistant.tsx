import { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface AIAssistantProps {
  editor: Editor | null;
}

interface Selection {
  text: string;
  from: number;
  to: number;
}

export default function AIAssistant({ editor }: AIAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const selectionRef = useRef<Selection | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const getSelectedText = () => {
    if (!editor) return null;
    
    const { from, to } = editor.state.selection;
    if (from === to) return null; // No selection
    
    return {
      text: editor.state.doc.textBetween(from, to),
      from,
      to
    };
  };

  // Update selection reference when text is selected
  useEffect(() => {
    if (!editor || !isOpen) return;

    const updateSelection = () => {
      const selection = getSelectedText();
      if (selection) {
        selectionRef.current = selection;
      }
    };

    // Listen for selection changes in the editor
    editor.on('selectionUpdate', updateSelection);
    
    return () => {
      editor.off('selectionUpdate', updateSelection);
    };
  }, [editor, isOpen]);

  const handleOpenPanel = () => {
    const selection = getSelectedText();
    if (selection) {
      selectionRef.current = selection;
      setIsOpen(true);
    } else {
      toast.error('Please select some text first');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor || !prompt.trim()) return;

    const selection = getSelectedText() || selectionRef.current;
    if (!selection) {
      toast.error('Please select some text to modify');
      return;
    }

    setLoading(true);
    try {
      const response = await api.chat(prompt, [
        {
          type: 'document',
          title: 'Selected Text',
          content: selection.text
        }
      ]);

      if (response.content) {
        editor
          .chain()
          .focus()
          .insertContentAt({ from: selection.from, to: selection.to }, response.content)
          .run();
        
        toast.success('Text updated successfully');
      }
    } catch (error) {
      console.error('Error getting AI assistance:', error);
      toast.error('Failed to get AI assistance');
    } finally {
      setLoading(false);
      setPrompt('');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleOpenPanel}
        className="bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
          />
        </svg>
      </button>

      {isOpen && (
        <div 
          ref={panelRef}
          className="fixed bottom-20 right-4 w-96 bg-white rounded-lg shadow-xl border border-gray-200"
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">AI Assistant</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Select text and enter your prompt to modify it
            </p>
            <form onSubmit={handleSubmit}>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Make this more formal, Fix grammar errors, Add more detail..."
                className="w-full h-32 p-2 border border-gray-300 rounded-md mb-2 resize-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className={`w-full py-2 px-4 rounded-md text-white ${
                  loading || !prompt.trim()
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Processing...' : 'Get AI Assistance'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
