'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, DocumentPlusIcon } from '@heroicons/react/24/solid';

interface Context {
  id: string;
  type: 'NOTE' | 'DOCUMENT' | 'RESOURCE';
  title: string;
  content: string;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  contexts?: Context[];
}

interface ContextSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (contexts: Context[]) => void;
  projectId: string;
}

const ContextSelector: React.FC<ContextSelectorProps> = ({ isOpen, onClose, onSelect, projectId }) => {
  const [selectedContexts, setSelectedContexts] = useState<Context[]>([]);
  const [availableContexts, setAvailableContexts] = useState<Context[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Fetch available contexts from the API
      fetchAvailableContexts();
    }
  }, [isOpen, projectId]);

  const fetchAvailableContexts = async () => {
    try {
      // TODO: Implement API calls to fetch notes, documents, and resources
      const mockContexts: Context[] = [
        { id: '1', type: 'NOTE', title: 'Sample Note', content: 'Sample note content' },
        { id: '2', type: 'DOCUMENT', title: 'Sample Document', content: 'Sample document content' },
      ];
      setAvailableContexts(mockContexts);
    } catch (error) {
      console.error('Error fetching contexts:', error);
    }
  };

  const handleContextSelect = (context: Context) => {
    setSelectedContexts(prev => 
      prev.find(c => c.id === context.id)
        ? prev.filter(c => c.id !== context.id)
        : [...prev, context]
    );
  };

  const handleConfirm = () => {
    onSelect(selectedContexts);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Add Context</h3>
        <div className="max-h-60 overflow-y-auto">
          {availableContexts.map(context => (
            <div
              key={context.id}
              className={`p-3 border rounded-lg mb-2 cursor-pointer ${
                selectedContexts.find(c => c.id === context.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
              }`}
              onClick={() => handleContextSelect(context)}
            >
              <div className="font-medium">{context.title}</div>
              <div className="text-sm text-gray-500">{context.type}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleConfirm}
          >
            Add Selected
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isContextSelectorOpen, setIsContextSelectorOpen] = useState(false);
  const [selectedContexts, setSelectedContexts] = useState<Context[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date(),
      contexts: selectedContexts.length > 0 ? selectedContexts : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedContexts([]);
    setIsLoading(true);

    try {
      // TODO: Implement API call to AI service with context
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'This is a placeholder response. The AI chat functionality will be implemented soon.',
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleContextSelect = (contexts: Context[]) => {
    setSelectedContexts(contexts);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow">
      {/* Chat header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">AI Legal Assistant</h2>
        <p className="text-sm text-gray-500">Get help with legal research and writing</p>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-[80%] rounded-lg px-4 py-2
                ${message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
                }
              `}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.contexts && message.contexts.length > 0 && (
                <div className="mt-2 pt-2 border-t border-opacity-20">
                  <p className="text-xs opacity-70">Attached Context:</p>
                  {message.contexts.map(context => (
                    <span
                      key={context.id}
                      className="inline-block text-xs px-2 py-1 rounded bg-opacity-20 bg-white mr-2 mt-1"
                    >
                      {context.title}
                    </span>
                  ))}
                </div>
              )}
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="animate-pulse flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
          {selectedContexts.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-2">
              {selectedContexts.map(context => (
                <span
                  key={context.id}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                >
                  {context.title}
                  <button
                    type="button"
                    className="ml-1 hover:text-blue-600"
                    onClick={() => setSelectedContexts(prev => prev.filter(c => c.id !== context.id))}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex items-end space-x-2">
            <div className="flex-1 min-h-[20px]">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
                rows={1}
                style={{ minHeight: '40px', maxHeight: '200px' }}
              />
            </div>
            <button
              type="button"
              onClick={() => setIsContextSelectorOpen(true)}
              className="p-2 rounded-lg hover:bg-indigo-50 transition-colors duration-200"
              title="Add Context"
            >
              <DocumentPlusIcon className="w-5 h-5 text-indigo-500 hover:text-indigo-600" />
            </button>
            <button
              type="submit"
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading || !input.trim()}
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      <ContextSelector
        isOpen={isContextSelectorOpen}
        onClose={() => setIsContextSelectorOpen(false)}
        onSelect={handleContextSelect}
        projectId="current-project-id" // TODO: Get from project context
      />
    </div>
  );
}
