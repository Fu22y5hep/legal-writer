import React from 'react';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';

interface FloatingCopyButtonProps {
  position: { x: number; y: number };
  onCopy: () => void;
}

export const FloatingCopyButton: React.FC<FloatingCopyButtonProps> = ({ position, onCopy }) => {
  return (
    <button
      className="absolute z-[99999] bg-white shadow-lg rounded-md px-3 py-2 cursor-pointer hover:bg-gray-50 transition-all duration-200 border border-gray-200 flex items-center gap-2"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onCopy();
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <DocumentDuplicateIcon className="h-5 w-5 text-gray-600" />
      <span className="text-sm font-medium text-gray-600">Create Note</span>
    </button>
  );
};
