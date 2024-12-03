import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FloatingCopyButton } from './FloatingCopyButton';
import { CreateNoteModal } from './CreateNoteModal';

interface SelectableTextProps {
  children: React.ReactNode;
  onCopy?: (text: string, title: string) => void;
}

export const SelectableText: React.FC<SelectableTextProps> = ({ children, onCopy }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showButton, setShowButton] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !containerRef.current) {
      setShowButton(false);
      return;
    }

    const text = selection.toString().trim();
    if (text) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      // Calculate position relative to the container
      const x = rect.x + (rect.width / 2) - containerRect.x;
      const y = rect.y - containerRect.y;

      setButtonPosition({ x, y });
      setSelectedText(text);
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  }, []);

  const handleCopy = useCallback(() => {
    if (selectedText) {
      setShowModal(true);
      setShowButton(false);
    }
  }, [selectedText]);

  const handleCreateNote = useCallback((title: string) => {
    if (onCopy && selectedText) {
      onCopy(selectedText, title);
    }
    setShowModal(false);
  }, [selectedText, onCopy]);

  // Handle selection changes
  useEffect(() => {
    let selectionTimeout: NodeJS.Timeout;
    
    const handleSelectionChange = () => {
      // Clear any existing timeout
      if (selectionTimeout) {
        clearTimeout(selectionTimeout);
      }
      
      // Set a small timeout to let the selection complete
      selectionTimeout = setTimeout(handleSelection, 100);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mouseup', handleSelectionChange);
    document.addEventListener('keyup', handleSelectionChange);
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mouseup', handleSelectionChange);
      document.removeEventListener('keyup', handleSelectionChange);
      if (selectionTimeout) {
        clearTimeout(selectionTimeout);
      }
    };
  }, [handleSelection]);

  // Hide button when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setShowButton(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative inline-block w-full"
      onContextMenu={(e) => {
        // Only prevent context menu when there's selected text
        if (selectedText) {
          e.preventDefault();
        }
      }}
    >
      {children}
      {showButton && (
        <FloatingCopyButton
          position={buttonPosition}
          onCopy={handleCopy}
        />
      )}
      <CreateNoteModal
        isOpen={showModal}
        selectedText={selectedText}
        onClose={() => setShowModal(false)}
        onConfirm={handleCreateNote}
      />
    </div>
  );
};
