'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  BoltIcon as BoldIcon,
  ArrowsPointingInIcon as ItalicIcon,
  MinusIcon as UnderlineIcon,
  ListBulletIcon,
  ListBulletIcon as ListOrderedIcon,
  ArrowUturnLeftIcon as UndoIcon,
  ArrowUturnRightIcon as RedoIcon,
  LinkIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';

interface EditorProps {
  initialContent?: string;
  onSave?: (content: string) => Promise<void>;
  readOnly?: boolean;
}

interface ToolbarButton {
  icon: React.ForwardRefExoticComponent<any>;
  command: string;
  label: string;
  value?: string;
}

const toolbarButtons: ToolbarButton[] = [
  { icon: BoldIcon, command: 'bold', label: 'Bold' },
  { icon: ItalicIcon, command: 'italic', label: 'Italic' },
  { icon: UnderlineIcon, command: 'underline', label: 'Underline' },
  { icon: ListBulletIcon, command: 'insertUnorderedList', label: 'Bullet List' },
  { icon: ListOrderedIcon, command: 'insertOrderedList', label: 'Numbered List' },
];

export default function EnhancedEditor({
  initialContent = '',
  onSave,
  readOnly = false,
}: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    const saveTimeout = setTimeout(async () => {
      if (content !== initialContent && onSave) {
        await handleSave();
      }
    }, 2000);

    return () => clearTimeout(saveTimeout);
  }, [content, initialContent]);

  const handleSave = async () => {
    if (isSaving || !onSave) return;

    setIsSaving(true);
    try {
      await onSave(content);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save document:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleLink = () => {
    const url = prompt('Enter URL:', 'https://');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const handleCopy = () => {
    if (selectedText) {
      navigator.clipboard.writeText(selectedText);
    }
  };

  const handleSelectionChange = () => {
    const selection = window.getSelection();
    if (selection) {
      setSelectedText(selection.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      execCommand('insertHTML', '&emsp;');
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          {toolbarButtons.map((button) => (
            <button
              key={button.command}
              onClick={() => execCommand(button.command, button.value)}
              className="p-1.5 rounded hover:bg-gray-100"
              title={button.label}
              disabled={readOnly}
            >
              <button.icon className="h-5 w-5 text-gray-600" />
            </button>
          ))}
          <div className="h-6 w-px bg-gray-300 mx-2" />
          <button
            onClick={handleLink}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Insert Link"
            disabled={readOnly}
          >
            <LinkIcon className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Copy Selection"
            disabled={!selectedText}
          >
            <DocumentDuplicateIcon className="h-5 w-5 text-gray-600" />
          </button>
          <div className="h-6 w-px bg-gray-300 mx-2" />
          <button
            onClick={() => execCommand('undo')}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Undo"
            disabled={readOnly}
          >
            <UndoIcon className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={() => execCommand('redo')}
            className="p-1.5 rounded hover:bg-gray-100"
            title="Redo"
            disabled={readOnly}
          >
            <RedoIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <div className="flex items-center space-x-4">
          {lastSaved && (
            <span className="text-sm text-gray-500">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          {onSave && (
            <button
              onClick={handleSave}
              disabled={isSaving || readOnly}
              className={`
                px-4 py-2 rounded text-white text-sm font-medium
                ${isSaving || readOnly
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
                }
              `}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-6 overflow-auto">
        <div
          ref={editorRef}
          contentEditable={!readOnly}
          onInput={(e) => setContent(e.currentTarget.innerHTML)}
          onKeyDown={handleKeyDown}
          onMouseUp={handleSelectionChange}
          onKeyUp={handleSelectionChange}
          dangerouslySetInnerHTML={{ __html: content }}
          className="prose max-w-none min-h-full focus:outline-none"
          style={{ minHeight: '100%' }}
        />
      </div>
    </div>
  );
}
