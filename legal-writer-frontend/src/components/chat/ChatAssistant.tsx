'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { PaperAirplaneIcon, DocumentPlusIcon } from '@heroicons/react/24/solid';
import { api } from '@/lib/api';

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
      fetchAvailableContexts();
    }
  }, [isOpen, projectId]);

  const fetchAvailableContexts = async () => {
    try {
      const contexts = await api.getAvailableContexts(projectId);
      setAvailableContexts(contexts);
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

interface ChatAssistantProps {
  projectId: string;
}

export default function ChatAssistant({ projectId }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isContextSelectorOpen, setIsContextSelectorOpen] = useState(false);
  const [selectedContexts, setSelectedContexts] = useState<Context[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date(),
      contexts: selectedContexts.length > 0 ? selectedContexts : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSelectedContexts([]);
    setIsLoading(true);
    setError(null);

    try {
      const data = await api.chat(inputMessage, selectedContexts.map(context => ({
        type: context.type,
        title: context.title,
        content: context.content
      })));
      
      if (!data || !data.content) {
        throw new Error('Invalid response from server');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.content,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message. Please try again.';
      setError(errorMessage);
      
      // Add error message to chat
      const errorAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I encountered an error. Please try again.",
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorAssistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContextSelect = (contexts: Context[]) => {
    setSelectedContexts(contexts);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.role === 'user' ? (
                <>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.contexts && message.contexts.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white border-opacity-20">
                      <p className="text-xs opacity-70">Attached Context:</p>
                      {message.contexts.map(context => (
                        <span
                          key={context.id}
                          className="inline-block text-xs px-2 py-1 rounded bg-white bg-opacity-20 mr-2 mt-1"
                        >
                          {context.title}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="prose prose-sm dark:prose-invert">
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={tomorrow}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </p>
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

      {/* Input Form */}
      <div className="border-t border-gray-200 p-4">
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
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={1}
                style={{ minHeight: '40px', maxHeight: '200px' }}
              />
            </div>
            <button
              type="button"
              onClick={() => setIsContextSelectorOpen(true)}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Add Context"
            >
              <DocumentPlusIcon className="w-6 h-6" />
            </button>
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      <ContextSelector
        isOpen={isContextSelectorOpen}
        onClose={() => setIsContextSelectorOpen(false)}
        onSelect={handleContextSelect}
        projectId={projectId}
      />
    </div>
  );
}
