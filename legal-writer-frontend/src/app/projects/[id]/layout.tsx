'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import FunctionPane from '@/components/projects/FunctionPane';

export default function ProjectDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const pathParts = pathname.split('/');
  
  // Only show FunctionPane if we're on the main project page (no additional segments after [id])
  const showFunctionPane = pathParts.length === 3 && pathParts[1] === 'projects';

  return (
    <div className="flex h-full">
      {showFunctionPane && (
        <FunctionPane className="w-80 min-w-[320px] border-r border-gray-200 bg-white" />
      )}
      <div className={`flex-1 overflow-auto ${showFunctionPane ? 'max-w-[calc(100%-320px)]' : 'max-w-full'}`}>
        {children}
      </div>
    </div>
  );
}
