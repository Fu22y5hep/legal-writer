'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState(256); // Default width in pixels
  const pathname = usePathname();

  // Don't show the layout on auth pages
  if (pathname === '/login' || pathname === '/register') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div 
        className="flex-none h-full bg-white shadow-md relative"
        style={{ width: `${sidebarWidth}px` }}
      >
        <Sidebar />
        {/* Resizer */}
        <div
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize bg-gray-200 hover:bg-blue-500 transition-colors"
          onMouseDown={(e) => {
            e.preventDefault();
            const startX = e.pageX;
            const startWidth = sidebarWidth;

            const onMouseMove = (e: MouseEvent) => {
              const newWidth = startWidth + (e.pageX - startX);
              if (newWidth >= 200 && newWidth <= 400) {
                setSidebarWidth(newWidth);
              }
            };

            const onMouseUp = () => {
              document.removeEventListener('mousemove', onMouseMove);
              document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
          }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
