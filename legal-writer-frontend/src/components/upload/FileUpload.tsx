'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  maxSize?: number; // in bytes
  className?: string;
}

export default function FileUpload({ onUpload, maxSize = 10485760, className = '' }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    try {
      // Only handle the first file for now
      await onUpload(acceptedFiles[0]);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    maxFiles: 1,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxSize,
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
        <CloudArrowUpIcon className={`mx-auto h-12 w-12 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
        
        <div className="text-gray-600">
          <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
          <p className="text-sm mt-1">PDF, DOC, DOCX, TXT files only (max {Math.round(maxSize / 1024 / 1024)}MB)</p>
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
