'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  maxSize?: number; // in bytes
  className?: string;
}

export default function FileUpload({ onUpload, maxSize = 10485760, className = '' }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    onUpload(acceptedFiles);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxSize,
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        ${className}`}
    >
      <input {...getInputProps()} />
      <div className="space-y-4">
        <svg
          className={`mx-auto h-12 w-12 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`}
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M24 14v20m-10-10h20"
          />
        </svg>
        
        <div className="text-gray-600">
          <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
          <p className="text-sm mt-1">PDF files only (max {Math.round(maxSize / 1024 / 1024)}MB)</p>
        </div>
      </div>

      {fileRejections.length > 0 && (
        <div className="mt-4 text-sm text-red-600">
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name} className="mt-1">
              {errors.map(error => (
                <p key={error.code}>{error.message}</p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
